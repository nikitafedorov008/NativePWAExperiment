/**
 * data/repositories/habits_repository — the single source of truth for habits.
 *
 * It owns the in-memory list, loads it once (seeding demo data on first run),
 * writes every change back through the storage service, and re-publishes an
 * immutable snapshot whenever anything changes — including when the clock
 * rolls over to a new day. Repositories never know about each other; write
 * rules live in domain/use_cases and are applied to this store.
 */
import { ChangeNotifier } from '../../core/change_notifier.ts';
import { todayKey } from '../../utils/dates.ts';
import { seedHabits } from '../../domain/use_cases/habits.ts';
import type { HabitsStore } from '../../domain/use_cases/habits.ts';
import type { DateKey, Habit } from '../../domain/models/habit.ts';
import { HABITS_STORAGE_KEY, fromEnvelope, toEnvelope } from '../models/habit_dto.ts';
import type { ClockService } from '../services/clock_service.ts';
import type { LocalStorageService } from '../services/local_storage_service.ts';

export interface HabitsState {
  habits: Habit[];
  today: DateKey;
}

export class HabitsRepository extends ChangeNotifier implements HabitsStore {
  #habits: Habit[] = [];
  #state: HabitsState;
  #unwatchClock: (() => void) | null = null;

  constructor(
    private readonly storage: LocalStorageService,
    private readonly clock: ClockService,
  ) {
    super();
    this.#state = { habits: [], today: clock.today };
  }

  get state(): HabitsState {
    return this.#state;
  }

  /** The store contract used by the write use cases. */
  get habits(): readonly Habit[] {
    return this.#habits;
  }

  /** Loads persisted habits (or demo data on first run) and watches the day. */
  load(): void {
    const stored = fromEnvelope(this.storage.read<unknown>(HABITS_STORAGE_KEY));
    this.#habits = stored ?? seedHabits(this.clock.today);
    if (!stored) this.persist();
    this.#unwatchClock ??= (() => {
      const listener = (): void => this.#publish();
      this.clock.addListener(listener);
      return () => this.clock.removeListener(listener);
    })();
    this.#publish();
  }

  /**
   * HabitsStore: the use cases mutate through here, so this is also where the
   * repository re-publishes — every write reaches subscribers without the
   * callers having to remember to notify.
   */
  replace(habits: Habit[]): void {
    this.#habits = habits;
    this.#publish();
  }

  persist(): void {
    this.storage.write(HABITS_STORAGE_KEY, toEnvelope(this.#habits));
  }

  /** Drops stored data and starts again from the demo set. */
  reset(): void {
    this.storage.remove(HABITS_STORAGE_KEY);
    this.replace(seedHabits(this.clock.today || todayKey()));
    this.persist();
  }

  dispose(): void {
    this.#unwatchClock?.();
    this.#unwatchClock = null;
    super.dispose();
  }

  #publish(): void {
    this.#state = { habits: [...this.#habits], today: this.clock.today };
    this.notifyListeners();
  }
}

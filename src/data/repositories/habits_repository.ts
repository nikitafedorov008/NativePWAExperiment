/**
 * data/repositories/habits_repository — the single source of truth for habits.
 *
 * The state lives in a zustand store so any subscriber can watch it; the
 * write use cases mutate through the plain `HabitsStore` contract below, and
 * every change is persisted and published. Repositories never know about each
 * other, and this one also republishes when the clock rolls over to a new day.
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';
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

export type HabitsStoreApi = StoreApi<HabitsState>;

export interface HabitsRepository extends HabitsStore {
  /** Subscribe with `useStore(repository.store)` or `repository.store.subscribe`. */
  readonly store: HabitsStoreApi;
  load(): void;
  reset(): void;
  dispose(): void;
}

export function createHabitsRepository(
  storage: LocalStorageService,
  clock: ClockService,
): HabitsRepository {
  const store = createStore<HabitsState>(() => ({ habits: [], today: clock.getState().today }));

  const persist = (): void => {
    storage.write(HABITS_STORAGE_KEY, toEnvelope(store.getState().habits));
  };

  const replace = (habits: Habit[]): void => {
    store.setState({ habits });
  };

  const unsubscribeClock = clock.subscribe((state) => {
    if (state.today !== store.getState().today) store.setState({ today: state.today });
  });

  return {
    store,
    get habits() {
      return store.getState().habits;
    },
    replace,
    persist,
    /** Loads persisted habits (or demo data on first run). */
    load(): void {
      const stored = fromEnvelope(storage.read<unknown>(HABITS_STORAGE_KEY));
      store.setState({ habits: stored ?? seedHabits(clock.getState().today), today: clock.getState().today });
      if (!stored) persist();
    },
    /** Drops stored data and starts again from the demo set. */
    reset(): void {
      storage.remove(HABITS_STORAGE_KEY);
      store.setState({ habits: seedHabits(clock.getState().today || todayKey()) });
      persist();
    },
    dispose(): void {
      unsubscribeClock();
    },
  };
}

/**
 * ui/today/view_models — the Today view model (MVVM's VM).
 *
 * It reads the habits repository, turns raw habits into presentation-ready
 * items (streak, seven-day strip, done-today flag), owns the editor state and
 * exposes the commands the view calls. Views stay dumb: they render `state`
 * and call methods, never compute.
 */
import { ChangeNotifier } from '../../../core/change_notifier.ts';
import { formatDateKey } from '../../../utils/dates.ts';
import { addHabit, getDayProgress, getHabitStats, removeHabit, renameHabit, toggleCompletion } from '../../../domain/use_cases/habits.ts';
import type { Habit, HabitInput } from '../../../domain/models/habit.ts';
import type { WeekDayView } from '../../../domain/use_cases/habits.ts';
import type { HabitsRepository } from '../../../data/repositories/habits_repository.ts';
import type { CelebrationService } from '../../../data/services/celebration_service.ts';

const DATE_LABEL: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

export interface TodayItem {
  id: string;
  name: string;
  emoji: string;
  doneToday: boolean;
  streak: number;
  days: WeekDayView[];
}

export interface TodayState {
  todayLabel: string;
  progress: { done: number; total: number; ratio: number };
  items: TodayItem[];
  editor: { open: boolean; habit: Habit | null };
}

export class TodayViewModel extends ChangeNotifier {
  #state: TodayState = {
    todayLabel: '',
    progress: { done: 0, total: 0, ratio: 0 },
    items: [],
    editor: { open: false, habit: null },
  };

  constructor(
    private readonly habits: HabitsRepository,
    private readonly celebration: CelebrationService,
  ) {
    super();
    this.habits.addListener(() => this.#recompute());
    this.#recompute();
  }

  get state(): TodayState {
    return this.#state;
  }

  toggleToday(id: string): void {
    this.toggleDay(id, this.habits.state.today);
  }

  /** Toggling the last missing habit of the day earns confetti. */
  toggleDay(id: string, dateKey: string): void {
    const before = this.habits.state.habits;
    const beforeProgress = getDayProgress(before, this.habits.state.today);
    const result = toggleCompletion(this.habits, id, dateKey, this.habits.state.today);
    if (!result.ok) return;
    const after = getDayProgress(this.habits.state.habits, this.habits.state.today);
    if (after.total > 0 && beforeProgress.ratio < 1 && after.ratio === 1) this.celebration.celebrate();
  }

  remove(id: string): void {
    removeHabit(this.habits, id);
  }

  /** The view passes an id; the view model owns resolving it to an entity. */
  openEditor(id: string | null): void {
    const habit = id ? this.habits.state.habits.find((h) => h.id === id) ?? null : null;
    this.#setEditor({ open: true, habit });
  }

  closeEditor(): void {
    this.#setEditor({ open: false, habit: null });
  }

  /** Returns false when the input was rejected, so the form can stay open. */
  submitEditor(input: HabitInput): boolean {
    const current = this.#state.editor.habit;
    const result = current
      ? renameHabit(this.habits, current.id, input)
      : addHabit(this.habits, input, this.habits.state.today);
    if (!result.ok) return false;
    this.#setEditor({ open: false, habit: null });
    return true;
  }

  #setEditor(editor: TodayState['editor']): void {
    this.#state = { ...this.#state, editor };
    this.notifyListeners();
  }

  #recompute(): void {
    const { habits, today } = this.habits.state;
    const items = habits.map((habit) => {
      const stats = getHabitStats(habit, today);
      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        doneToday: stats.doneToday,
        streak: stats.currentStreak,
        days: stats.weekStrip,
      };
    });
    this.#state = {
      ...this.#state,
      todayLabel: formatDateKey(today, DATE_LABEL),
      progress: getDayProgress(habits, today),
      items,
    };
    this.notifyListeners();
  }
}

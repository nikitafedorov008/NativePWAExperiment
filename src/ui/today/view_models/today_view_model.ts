/**
 * ui/today/view_models — the Today view model, a zustand store.
 *
 * It reads the habits repository, turns raw habits into presentation-ready
 * items (streak, seven-day strip, done-today flag), owns the editor state and
 * exposes the commands the view calls — data and actions deliberately in one
 * store, which is how views consume it: `const { items, toggleToday } = useStore(vm)`.
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';
import { formatDateKey } from '../../../utils/dates.ts';
import {
  addHabit,
  getDayProgress,
  getHabitStats,
  removeHabit,
  renameHabit,
  toggleCompletion,
} from '../../../domain/use_cases/habits.ts';
import type { Habit, HabitInput } from '../../../domain/models/habit.ts';
import type { HabitsRepository } from '../../../data/repositories/habits_repository.ts';
import type { CelebrationService } from '../../../data/services/celebration_service.ts';

const DATE_LABEL: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

export interface TodayItem {
  id: string;
  name: string;
  emoji: string;
  doneToday: boolean;
  streak: number;
  days: ReturnType<typeof getHabitStats>['weekStrip'];
}

export interface TodayState {
  todayLabel: string;
  progress: { done: number; total: number; ratio: number };
  items: TodayItem[];
  editor: { open: boolean; habit: Habit | null };
}

export interface TodayActions {
  toggleToday(id: string): void;
  toggleDay(id: string, dateKey: string): void;
  remove(id: string): void;
  openEditor(id: string | null): void;
  closeEditor(): void;
  submitEditor(input: HabitInput): boolean;
}

export type TodayViewModel = StoreApi<TodayState & TodayActions>;

export interface TodayDeps {
  habits: HabitsRepository;
  /** Only the one method the view model needs, so tests can pass a stub. */
  celebration: Pick<CelebrationService, 'celebrate'>;
}

export function createTodayViewModel({ habits, celebration }: TodayDeps): TodayViewModel {
  const store = createStore<TodayState & TodayActions>((set, get) => ({
    todayLabel: '',
    progress: { done: 0, total: 0, ratio: 0 },
    items: [],
    editor: { open: false, habit: null },

    toggleToday: (id) => get().toggleDay(id, habits.store.getState().today),

    /** Toggling the last missing habit of the day earns confetti. */
    toggleDay: (id, dateKey) => {
      const today = habits.store.getState().today;
      const before = getDayProgress(habits.habits, today);
      if (!toggleCompletion(habits, id, dateKey, today).ok) return;
      const after = getDayProgress(habits.habits, today);
      if (after.total > 0 && before.ratio < 1 && after.ratio === 1) celebration.celebrate();
    },

    remove: (id) => {
      removeHabit(habits, id);
    },

    /** The view passes an id; the view model owns resolving it to an entity. */
    openEditor: (id) => {
      const habit = id ? habits.habits.find((h) => h.id === id) ?? null : null;
      set({ editor: { open: true, habit } });
    },

    closeEditor: () => set({ editor: { open: false, habit: null } }),

    /** Returns false when the input was rejected, so the form can stay open. */
    submitEditor: (input) => {
      const current = get().editor.habit;
      const result = current
        ? renameHabit(habits, current.id, input)
        : addHabit(habits, input, habits.store.getState().today);
      if (!result.ok) return false;
      set({ editor: { open: false, habit: null } });
      return true;
    },
  }));

  const recompute = (): void => {
    const { habits: list, today } = habits.store.getState();
    store.setState({
      todayLabel: formatDateKey(today, DATE_LABEL),
      progress: getDayProgress(list, today),
      items: list.map((habit) => {
        const stats = getHabitStats(habit, today);
        return {
          id: habit.id,
          name: habit.name,
          emoji: habit.emoji,
          doneToday: stats.doneToday,
          streak: stats.currentStreak,
          days: stats.weekStrip,
        };
      }),
    });
  };

  habits.store.subscribe(recompute);
  recompute();
  return store;
}

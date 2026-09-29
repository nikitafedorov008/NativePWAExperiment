/**
 * ui/stats/view_models — the Stats view model. It formats the summary tiles and
 * the per-habit line, so all three views render plain strings.
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';
import { getHabitStats, getOverallStats } from '../../../domain/use_cases/habits.ts';
import type { HabitsRepository } from '../../../data/repositories/habits_repository.ts';

export interface StatsItem {
  id: string;
  name: string;
  emoji: string;
  summary: string;
  days: ReturnType<typeof getHabitStats>['weekStrip'];
}

export interface StatsState {
  tiles: { label: string; value: string }[];
  items: StatsItem[];
}

export type StatsViewModel = StoreApi<StatsState>;

export function createStatsViewModel(habits: HabitsRepository): StatsViewModel {
  const store = createStore<StatsState>(() => ({ tiles: [], items: [] }));

  const recompute = (): void => {
    const { habits: list, today } = habits.store.getState();
    const overall = getOverallStats(list, today);
    const best = overall.bestStreakHabit;

    store.setState({
      tiles: [
        { label: 'Total completions', value: String(overall.totalCompletions) },
        { label: 'Best streak', value: best ? `${best.emoji} ${best.name} · ${best.bestStreak} days` : '—' },
        { label: 'Perfect days (7d)', value: String(overall.perfectDays7) },
        { label: 'Completion rate (7d)', value: `${Math.round(overall.completionRate7 * 100)}%` },
      ],
      items: list.map((habit) => {
        const stats = getHabitStats(habit, today);
        return {
          id: habit.id,
          name: habit.name,
          emoji: habit.emoji,
          summary: `🔥 ${stats.currentStreak} current · ${stats.bestStreak} best · ${stats.doneCount} done`,
          days: stats.weekStrip,
        };
      }),
    });
  };

  habits.store.subscribe(recompute);
  recompute();
  return store;
}

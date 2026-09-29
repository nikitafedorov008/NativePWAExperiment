/**
 * ui/stats/view_models — the Stats view model. Formats the summary tiles and
 * the per-habit line so all three views render plain strings.
 */
import { ChangeNotifier } from '../../../core/change_notifier.ts';
import { getHabitStats, getOverallStats } from '../../../domain/use_cases/habits.ts';
import type { WeekDayView } from '../../../domain/use_cases/habits.ts';
import type { HabitsRepository } from '../../../data/repositories/habits_repository.ts';

export interface StatsItem {
  id: string;
  name: string;
  emoji: string;
  summary: string;
  days: WeekDayView[];
}

export interface StatsState {
  tiles: { label: string; value: string }[];
  items: StatsItem[];
}

export class StatsViewModel extends ChangeNotifier {
  #state: StatsState = { tiles: [], items: [] };

  constructor(private readonly habits: HabitsRepository) {
    super();
    this.habits.addListener(() => this.#recompute());
    this.#recompute();
  }

  get state(): StatsState {
    return this.#state;
  }

  #recompute(): void {
    const { habits, today } = this.habits.state;
    const overall = getOverallStats(habits, today);
    const best = overall.bestStreakHabit;

    this.#state = {
      tiles: [
        { label: 'Total completions', value: String(overall.totalCompletions) },
        { label: 'Best streak', value: best ? `${best.emoji} ${best.name} · ${best.bestStreak} days` : '—' },
        { label: 'Perfect days (7d)', value: String(overall.perfectDays7) },
        { label: 'Completion rate (7d)', value: `${Math.round(overall.completionRate7 * 100)}%` },
      ],
      items: habits.map((habit) => {
        const stats = getHabitStats(habit, today);
        return {
          id: habit.id,
          name: habit.name,
          emoji: habit.emoji,
          summary: `🔥 ${stats.currentStreak} current · ${stats.bestStreak} best · ${stats.doneCount} done`,
          days: stats.weekStrip,
        };
      }),
    };
    this.notifyListeners();
  }
}

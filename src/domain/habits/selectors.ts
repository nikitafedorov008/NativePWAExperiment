/**
 * Derived values: streaks, per-day progress and the seven-day strip.
 * Pure functions over `Habit[]` — no state, no I/O, easy to unit-test.
 */
import { addDays, formatDateKey, lastNDays } from './dates.ts';
import type { DateKey, Habit, HabitId } from './model.ts';

export interface WeekDay {
  date: DateKey;
  done: boolean;
  weekday: string;
  dayOfMonth: number;
  isToday: boolean;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  doneCount: number;
  weekStrip: WeekDay[];
}

export interface DayProgress {
  done: number;
  total: number;
  ratio: number;
}

export interface BestStreakHabit {
  id: HabitId;
  name: string;
  emoji: string;
  bestStreak: number;
}

export interface OverallStats {
  totalCompletions: number;
  bestStreakHabit: BestStreakHabit | null;
  perfectDays7: number;
  completionRate7: number;
}

export const isDoneOn = (habit: Habit, dateKey: DateKey): boolean =>
  habit.completions.includes(dateKey);

export function currentStreak(habit: Habit, today: DateKey): number {
  const done = new Set(habit.completions);
  let day = done.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

export function bestStreak(habit: Habit): number {
  let best = 0;
  let run = 0;
  let prev: DateKey | null = null;
  for (const key of habit.completions) {
    run = prev !== null && addDays(prev, 1) === key ? run + 1 : 1;
    if (run > best) best = run;
    prev = key;
  }
  return best;
}

export const weekStrip = (habit: Habit, today: DateKey): WeekDay[] =>
  lastNDays(today, 7).map((date) => ({
    date,
    done: isDoneOn(habit, date),
    weekday: formatDateKey(date, { weekday: 'short' }),
    dayOfMonth: Number(date.slice(8, 10)),
    isToday: date === today,
  }));

export function dayProgress(habits: Habit[], day: DateKey): DayProgress {
  const eligible = habits.filter((h) => h.createdAt <= day);
  const total = eligible.length;
  const done = eligible.filter((h) => isDoneOn(h, day)).length;
  return { done, total, ratio: total ? done / total : 0 };
}

export const habitStats = (habit: Habit, today: DateKey): HabitStats => ({
  currentStreak: currentStreak(habit, today),
  bestStreak: bestStreak(habit),
  doneCount: habit.completions.length,
  weekStrip: weekStrip(habit, today),
});

function bestStreakHabit(habits: Habit[]): BestStreakHabit | null {
  let best: BestStreakHabit | null = null;
  for (const habit of habits) {
    const streak = bestStreak(habit);
    if (streak > 0 && (best === null || streak > best.bestStreak)) {
      best = { id: habit.id, name: habit.name, emoji: habit.emoji, bestStreak: streak };
    }
  }
  return best;
}

export function overallStats(habits: Habit[], today: DateKey): OverallStats {
  let perfectDays7 = 0;
  let done7 = 0;
  let total7 = 0;
  for (const day of lastNDays(today, 7)) {
    const { done, total } = dayProgress(habits, day);
    if (total > 0 && done === total) perfectDays7 += 1;
    done7 += done;
    total7 += total;
  }
  return {
    totalCompletions: habits.reduce((sum, h) => sum + h.completions.length, 0),
    bestStreakHabit: bestStreakHabit(habits),
    perfectDays7,
    completionRate7: total7 ? done7 / total7 : 0,
  };
}

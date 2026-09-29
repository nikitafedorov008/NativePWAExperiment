/**
 * domain/use_cases — application rules, one concern per file.
 *
 * Write use cases take the repository and return a `Result`; they own the
 * rules (a name is required, a future day cannot be completed, a stale id is
 * rejected) so neither the repository nor the view models have to repeat them.
 */
import { addDays, lastNDays } from '../../utils/dates.ts';
import { createHabit, isDateKey, normalizeName } from '../models/habit.ts';
import type { DateKey, Habit, HabitId, HabitInput } from '../models/habit.ts';
import { fail, ok } from '../models/result.ts';
import type { Result } from '../models/result.ts';

export interface HabitsStore {
  habits: readonly Habit[];
  replace(habits: Habit[]): void;
  persist(): void;
}

/** Adds a habit whose streak starts today. */
export function addHabit(store: HabitsStore, input: HabitInput, today: DateKey): Result<Habit> {
  const name = normalizeName(input.name);
  if (!name) return fail('empty-name');
  const habit = createHabit({ name, emoji: input.emoji, createdAt: today });
  store.replace([...store.habits, habit]);
  store.persist();
  return ok(habit);
}

/** Renames (and optionally re-emojis) an existing habit. */
export function renameHabit(store: HabitsStore, id: HabitId, input: HabitInput): Result<Habit> {
  const name = normalizeName(input.name);
  if (!name) return fail('empty-name');
  const target = store.habits.find((h) => h.id === id);
  if (!target) return fail('unknown-habit');
  const renamed: Habit = { ...target, name, emoji: input.emoji || target.emoji };
  store.replace(store.habits.map((h) => (h.id === id ? renamed : h)));
  store.persist();
  return ok(renamed);
}

export function removeHabit(store: HabitsStore, id: HabitId): Result<HabitId> {
  if (!store.habits.some((h) => h.id === id)) return fail('unknown-habit');
  store.replace(store.habits.filter((h) => h.id !== id));
  store.persist();
  return ok(id);
}

/**
 * Toggles a completion. Rejects malformed keys, future days and unknown ids —
 * this is the rule that keeps "history" honest.
 */
export function toggleCompletion(
  store: HabitsStore,
  id: HabitId,
  dateKey: DateKey,
  today: DateKey,
): Result<Habit> {
  if (!isDateKey(dateKey)) return fail('invalid-date');
  if (dateKey > today) return fail('future-date');
  const target = store.habits.find((h) => h.id === id);
  if (!target) return fail('unknown-habit');

  const completions = target.completions.includes(dateKey)
    ? target.completions.filter((key) => key !== dateKey)
    : [...target.completions, dateKey].sort();
  const updated: Habit = { ...target, completions };
  store.replace(store.habits.map((h) => (h.id === id ? updated : h)));
  store.persist();
  return ok(updated);
}

/* ---------- read models (pure derivations view models consume) ---------- */

export interface WeekDayView {
  date: DateKey;
  done: boolean;
  weekday: string;
  dayOfMonth: number;
  isToday: boolean;
}

export interface HabitStatsView {
  habit: Habit;
  doneToday: boolean;
  currentStreak: number;
  bestStreak: number;
  doneCount: number;
  weekStrip: WeekDayView[];
}

export interface DayProgressView {
  done: number;
  total: number;
  ratio: number;
}

export interface BestStreakView {
  id: HabitId;
  name: string;
  emoji: string;
  bestStreak: number;
}

export interface OverallStatsView {
  totalCompletions: number;
  bestStreakHabit: BestStreakView | null;
  perfectDays7: number;
  completionRate7: number;
}

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

export const isDoneOn = (habit: Habit, dateKey: DateKey): boolean =>
  habit.completions.includes(dateKey);

/** Presentation-ready stats for one habit — what a view renders directly. */
export function getHabitStats(habit: Habit, today: DateKey): HabitStatsView {
  const weekStrip = lastNDays(today, 7).map((date) => ({
    date,
    done: isDoneOn(habit, date),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(
      new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))),
    ),
    dayOfMonth: Number(date.slice(8, 10)),
    isToday: date === today,
  }));
  return {
    habit,
    doneToday: isDoneOn(habit, today),
    currentStreak: currentStreak(habit, today),
    bestStreak: bestStreak(habit),
    doneCount: habit.completions.length,
    weekStrip,
  };
}

export function getDayProgress(habits: readonly Habit[], day: DateKey): DayProgressView {
  const eligible = habits.filter((h) => h.createdAt <= day);
  const total = eligible.length;
  const done = eligible.filter((h) => isDoneOn(h, day)).length;
  return { done, total, ratio: total ? done / total : 0 };
}

function bestStreakHabit(habits: readonly Habit[]): BestStreakView | null {
  let best: BestStreakView | null = null;
  for (const habit of habits) {
    const streak = bestStreak(habit);
    if (streak > 0 && (best === null || streak > best.bestStreak)) {
      best = { id: habit.id, name: habit.name, emoji: habit.emoji, bestStreak: streak };
    }
  }
  return best;
}

export function getOverallStats(habits: readonly Habit[], today: DateKey): OverallStatsView {
  let perfectDays7 = 0;
  let done7 = 0;
  let total7 = 0;
  for (const day of lastNDays(today, 7)) {
    const { done, total } = getDayProgress(habits, day);
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

/** Four demo habits with a believable two-week history (first run only). */
export function seedHabits(today: DateKey): Habit[] {
  const createdAt = addDays(today, -13);
  const range = (from: number, to: number): DateKey[] => {
    const keys: DateKey[] = [];
    for (let offset = from; offset <= to; offset += 1) keys.push(addDays(today, offset));
    return keys;
  };
  const seed = (name: string, emoji: string, completions: DateKey[]): Habit => ({
    ...createHabit({ name, emoji, createdAt }),
    completions,
  });
  return [
    seed('Drink water', '💧', range(-6, -1)),
    seed('Read 20 min', '📚', range(-6, -3)),
    seed('Walk 10k steps', '🚶', [addDays(today, -6), addDays(today, -4), addDays(today, -2)]),
    seed('Meditate', '🧘', [addDays(today, -1)]),
  ];
}

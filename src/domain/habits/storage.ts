/**
 * Persistence: habits live in localStorage behind a versioned envelope.
 * Every access is guarded — private mode, quota errors or corrupt JSON must
 * never take the app down, and a payload that fails validation is treated as
 * "nothing stored" rather than crashing the reducer.
 */
import { addDays } from './dates.ts';
import { createHabit, isDateKey } from './model.ts';
import type { DateKey, Habit } from './model.ts';

const STORAGE_KEY = 'streaks.habits.v1';
const VERSION = 1;

const isHabit = (h: unknown): h is Habit => {
  if (h === null || typeof h !== 'object') return false;
  const candidate = h as Partial<Habit>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.emoji === 'string' &&
    isDateKey(candidate.createdAt) &&
    Array.isArray(candidate.completions) &&
    candidate.completions.every(isDateKey)
  );
};

const safely = <T>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

export const loadHabits = (): Habit[] | null =>
  safely(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: number; habits?: unknown };
    if (parsed?.version !== VERSION || !Array.isArray(parsed.habits)) return null;
    return parsed.habits.every(isHabit) ? parsed.habits : null;
  });

export const saveHabits = (habits: Habit[]): void => {
  safely(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, habits })));
};

export const clearHabits = (): void => {
  safely(() => localStorage.removeItem(STORAGE_KEY));
};

const range = (todayKey: DateKey, from: number, to: number): DateKey[] => {
  const keys: DateKey[] = [];
  for (let offset = from; offset <= to; offset += 1) keys.push(addDays(todayKey, offset));
  return keys;
};

/** Four demo habits with a believable two-week history. */
export function seedHabits(today: DateKey): Habit[] {
  const createdAt = addDays(today, -13);
  const seed = (name: string, emoji: string, completions: DateKey[]): Habit => ({
    ...createHabit({ name, emoji, createdAt }),
    completions,
  });
  return [
    seed('Drink water', '💧', range(today, -6, -1)),
    seed('Read 20 min', '📚', range(today, -6, -3)),
    seed('Walk 10k steps', '🚶', [addDays(today, -6), addDays(today, -4), addDays(today, -2)]),
    seed('Meditate', '🧘', [addDays(today, -1)]),
  ];
}

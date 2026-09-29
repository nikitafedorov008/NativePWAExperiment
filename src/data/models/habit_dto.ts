/**
 * data/models/habit_dto — how a habit looks on disk, and how it becomes a
 * domain entity again. The envelope is versioned; anything that fails
 * validation is treated as "nothing stored" rather than crashing the app.
 */
import { isDateKey } from '../../domain/models/habit.ts';
import type { DateKey, Habit } from '../../domain/models/habit.ts';

export const HABITS_STORAGE_KEY = 'habits';
export const HABITS_SCHEMA_VERSION = 1;

export interface HabitsEnvelope {
  version: number;
  habits: Habit[];
}

const isHabitDto = (value: unknown): value is Habit => {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Partial<Habit>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.emoji === 'string' &&
    isDateKey(candidate.createdAt) &&
    Array.isArray(candidate.completions) &&
    candidate.completions.every(isDateKey)
  );
};

export const toEnvelope = (habits: readonly Habit[]): HabitsEnvelope => ({
  version: HABITS_SCHEMA_VERSION,
  habits: habits.map((habit) => ({ ...habit, completions: [...habit.completions] as DateKey[] })),
});

/** Returns null for a missing, foreign-version or malformed payload. */
export function fromEnvelope(raw: unknown): Habit[] | null {
  if (raw === null || typeof raw !== 'object') return null;
  const envelope = raw as Partial<HabitsEnvelope>;
  if (envelope.version !== HABITS_SCHEMA_VERSION || !Array.isArray(envelope.habits)) return null;
  return envelope.habits.every(isHabitDto) ? envelope.habits : null;
}

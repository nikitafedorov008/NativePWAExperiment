/**
 * domain/models — entities and value objects. Pure TypeScript: no React, no
 * DOM, no storage. In Flutter terms this is the domain model layer.
 */

/** Local calendar day, `YYYY-MM-DD`. */
export type DateKey = string;
export type HabitId = string;

export interface Habit {
  id: HabitId;
  name: string;
  emoji: string;
  createdAt: DateKey;
  /** Sorted, unique date keys. */
  completions: DateKey[];
}

export interface HabitInput {
  name: string;
  emoji?: string;
}

export const NAME_MAX_LENGTH = 40;
export const DEFAULT_EMOJI = '✅';
export const EMOJI_PRESETS = [
  '💧', '📚', '🚶', '🧘', '🏃', '💪', '🥗', '😴', '✍️', '🎸', '🧹', '💊',
] as const;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isDateKey = (value: unknown): value is DateKey =>
  typeof value === 'string' && DATE_KEY_RE.test(value);

/** Trims, collapses whitespace and caps the length — the one naming rule. */
export const normalizeName = (name: unknown): string =>
  String(name ?? '').trim().replace(/\s+/g, ' ').slice(0, NAME_MAX_LENGTH).trim();

const newId = (): HabitId =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** Factory for a new, empty habit. `createdAt` is passed in (never `new Date()` here). */
export const createHabit = (input: { name: string; emoji?: string; createdAt: DateKey }): Habit => ({
  id: newId(),
  name: normalizeName(input.name),
  emoji: input.emoji || DEFAULT_EMOJI,
  createdAt: input.createdAt,
  completions: [],
});

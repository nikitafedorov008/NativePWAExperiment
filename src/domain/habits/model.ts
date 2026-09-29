/**
 * Domain: habit model and reducer. Pure TypeScript, no React, no DOM —
 * this module is the single source of truth for what a habit is.
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

export type HabitAction =
  | { type: 'habit/added'; habit: Habit }
  | { type: 'habit/renamed'; id: HabitId; name: string; emoji?: string }
  | { type: 'habit/removed'; id: HabitId }
  | { type: 'completion/toggled'; id: HabitId; dateKey: DateKey; today: DateKey }
  | { type: 'habits/replaced'; habits: Habit[] };

export const NAME_MAX_LENGTH = 40;
export const DEFAULT_EMOJI = '✅';
export const EMOJI_PRESETS = [
  '💧', '📚', '🚶', '🧘', '🏃', '💪', '🥗', '😴', '✍️', '🎸', '🧹', '💊',
] as const;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isDateKey = (value: unknown): value is DateKey =>
  typeof value === 'string' && DATE_KEY_RE.test(value);

export const normalizeName = (name: unknown): string =>
  String(name ?? '').trim().replace(/\s+/g, ' ').slice(0, NAME_MAX_LENGTH).trim();

const newId = (): HabitId =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const createHabit = (input: { name: string; emoji?: string; createdAt: DateKey }): Habit => ({
  id: newId(),
  name: normalizeName(input.name),
  emoji: input.emoji || DEFAULT_EMOJI,
  createdAt: input.createdAt,
  completions: [],
});

export const habitAdded = (habit: Habit): HabitAction => ({ type: 'habit/added', habit });
export const habitRenamed = (id: HabitId, input: { name: string; emoji?: string }): HabitAction => ({
  type: 'habit/renamed',
  id,
  name: input.name,
  emoji: input.emoji,
});
export const habitRemoved = (id: HabitId): HabitAction => ({ type: 'habit/removed', id });
export const completionToggled = (id: HabitId, dateKey: DateKey, today: DateKey): HabitAction => ({
  type: 'completion/toggled',
  id,
  dateKey,
  today,
});
export const habitsReplaced = (habits: Habit[]): HabitAction => ({ type: 'habits/replaced', habits });

const toggleCompletion = (completions: DateKey[], dateKey: DateKey): DateKey[] =>
  completions.includes(dateKey)
    ? completions.filter((key) => key !== dateKey)
    : [...completions, dateKey].sort();

export function habitsReducer(state: Habit[], action: HabitAction): Habit[] {
  switch (action.type) {
    case 'habit/added':
      return [...state, action.habit];
    case 'habit/renamed': {
      const name = normalizeName(action.name);
      if (!name || !state.some((h) => h.id === action.id)) return state;
      return state.map((h) =>
        h.id === action.id ? { ...h, name, emoji: action.emoji || DEFAULT_EMOJI } : h,
      );
    }
    case 'habit/removed':
      return state.some((h) => h.id === action.id) ? state.filter((h) => h.id !== action.id) : state;
    case 'completion/toggled': {
      const { id, dateKey, today } = action;
      if (!isDateKey(dateKey) || dateKey > today || !state.some((h) => h.id === id)) {
        return state;
      }
      return state.map((h) =>
        h.id === id ? { ...h, completions: toggleCompletion(h.completions, dateKey) } : h,
      );
    }
    case 'habits/replaced':
      return action.habits;
    default:
      return state;
  }
}

/**
 * @typedef {Object} Habit
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {string} createdAt 'YYYY-MM-DD' local date key
 * @property {string[]} completions sorted unique date keys
 */

export const NAME_MAX_LENGTH = 40;
export const DEFAULT_EMOJI = '✅';
export const EMOJI_PRESETS = ['💧', '📚', '🚶', '🧘', '🏃', '💪', '🥗', '😴', '✍️', '🎸', '🧹', '💊'];

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeName = (name) =>
  String(name ?? '').trim().replace(/\s+/g, ' ').slice(0, NAME_MAX_LENGTH).trim();

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const createHabit = ({ name, emoji, createdAt }) => ({
  id: newId(),
  name: normalizeName(name),
  emoji: emoji || DEFAULT_EMOJI,
  createdAt,
  completions: [],
});

export const habitAdded = (habit) => ({ type: 'habit/added', habit });
export const habitRenamed = (id, { name, emoji }) => ({ type: 'habit/renamed', id, name, emoji });
export const habitRemoved = (id) => ({ type: 'habit/removed', id });
export const completionToggled = (id, dateKey, today) => ({
  type: 'completion/toggled',
  id,
  dateKey,
  today,
});
export const habitsReplaced = (habits) => ({ type: 'habits/replaced', habits });

const toggleCompletion = (completions, dateKey) =>
  completions.includes(dateKey)
    ? completions.filter((key) => key !== dateKey)
    : [...completions, dateKey].sort();

export function habitsReducer(state, action) {
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
      if (!DATE_KEY_RE.test(dateKey) || dateKey > today || !state.some((h) => h.id === id)) {
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

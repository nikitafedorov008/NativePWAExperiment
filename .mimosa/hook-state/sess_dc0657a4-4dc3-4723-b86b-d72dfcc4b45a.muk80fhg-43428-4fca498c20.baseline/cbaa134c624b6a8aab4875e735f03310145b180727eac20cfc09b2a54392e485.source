import { addDays } from './dates.js';
import { createHabit } from './model.js';

const STORAGE_KEY = 'streaks.habits.v1';
const VERSION = 1;

const isDateKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const isHabit = (h) =>
  h !== null &&
  typeof h === 'object' &&
  typeof h.id === 'string' &&
  typeof h.name === 'string' &&
  typeof h.emoji === 'string' &&
  isDateKey(h.createdAt) &&
  Array.isArray(h.completions) &&
  h.completions.every(isDateKey);

const safely = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

export const loadHabits = () =>
  safely(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== VERSION || !Array.isArray(parsed.habits)) return null;
    return parsed.habits.every(isHabit) ? parsed.habits : null;
  });

export const saveHabits = (habits) =>
  safely(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, habits })));

export const clearHabits = () => safely(() => localStorage.removeItem(STORAGE_KEY));

const range = (todayKey, from, to) => {
  const keys = [];
  for (let offset = from; offset <= to; offset += 1) keys.push(addDays(todayKey, offset));
  return keys;
};

export function seedHabits(today) {
  const createdAt = addDays(today, -13);
  const seed = (name, emoji, completions) => ({
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

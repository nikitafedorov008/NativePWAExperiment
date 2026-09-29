/**
 * utils/ — small framework-free helpers, the analog of Flutter's `lib/utils/`.
 * Dates work on local `YYYY-MM-DD` keys so no time zone or DST edge case can
 * shift "today"; the app never stores Date objects.
 */
import type { DateKey } from '../domain/models/habit.ts';

const pad = (n: number): string => String(n).padStart(2, '0');

export const toDateKey = (date: Date): DateKey =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (key: DateKey): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

export const addDays = (key: DateKey, n: number): DateKey => {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + n);
  return toDateKey(date);
};

export const lastNDays = (todayKey: DateKey, n: number): DateKey[] =>
  Array.from({ length: n }, (_, i) => addDays(todayKey, i - (n - 1)));

export const todayKey = (): DateKey => toDateKey(new Date());

export const formatDateKey = (key: DateKey, intlOpts?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(undefined, intlOpts).format(parseDateKey(key));

export const msUntilNextMidnight = (now: Date = new Date()): number => {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
};

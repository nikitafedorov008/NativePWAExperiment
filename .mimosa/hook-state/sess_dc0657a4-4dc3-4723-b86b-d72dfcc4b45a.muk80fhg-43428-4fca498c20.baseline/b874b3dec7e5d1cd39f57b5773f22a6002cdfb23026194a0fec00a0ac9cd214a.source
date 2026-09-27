const pad = (n) => String(n).padStart(2, '0');

export const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key, n) => {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + n);
  return toDateKey(date);
};

export const lastNDays = (todayKey, n) =>
  Array.from({ length: n }, (_, i) => addDays(todayKey, i - (n - 1)));

export const todayKey = () => toDateKey(new Date());

export const formatDateKey = (key, intlOpts) =>
  new Intl.DateTimeFormat(undefined, intlOpts).format(parseDateKey(key));

export const msUntilNextMidnight = (now = new Date()) => {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
};

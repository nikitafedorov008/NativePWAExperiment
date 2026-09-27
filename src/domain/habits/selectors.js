import { addDays, formatDateKey, lastNDays } from './dates.js';

export const isDoneOn = (habit, dateKey) => habit.completions.includes(dateKey);

export function currentStreak(habit, today) {
  const done = new Set(habit.completions);
  let day = done.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

export function bestStreak(habit) {
  let best = 0;
  let run = 0;
  let prev = null;
  for (const key of habit.completions) {
    run = prev !== null && addDays(prev, 1) === key ? run + 1 : 1;
    if (run > best) best = run;
    prev = key;
  }
  return best;
}

export const weekStrip = (habit, today) =>
  lastNDays(today, 7).map((date) => ({
    date,
    done: isDoneOn(habit, date),
    weekday: formatDateKey(date, { weekday: 'short' }),
    dayOfMonth: Number(date.slice(8, 10)),
    isToday: date === today,
  }));

export function dayProgress(habits, day) {
  const eligible = habits.filter((h) => h.createdAt <= day);
  const total = eligible.length;
  const done = eligible.filter((h) => isDoneOn(h, day)).length;
  return { done, total, ratio: total ? done / total : 0 };
}

export const habitStats = (habit, today) => ({
  currentStreak: currentStreak(habit, today),
  bestStreak: bestStreak(habit),
  doneCount: habit.completions.length,
  weekStrip: weekStrip(habit, today),
});

function bestStreakHabit(habits) {
  let best = null;
  for (const habit of habits) {
    const streak = bestStreak(habit);
    if (streak > 0 && (best === null || streak > best.bestStreak)) {
      best = { id: habit.id, name: habit.name, emoji: habit.emoji, bestStreak: streak };
    }
  }
  return best;
}

export function overallStats(habits, today) {
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

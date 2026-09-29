import { describe, expect, it } from 'vitest';
import {
  bestStreak,
  currentStreak,
  dayProgress,
  habitStats,
  isDoneOn,
  overallStats,
  weekStrip,
} from '../selectors.ts';
import type { Habit } from '../model.ts';

const TODAY = '2026-09-05';

const habit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'h1',
  name: 'Read',
  emoji: '📚',
  createdAt: '2026-08-23',
  completions: [],
  ...overrides,
});

describe('isDoneOn', () => {
  it('checks membership', () => {
    const h = habit({ completions: [TODAY] });
    expect(isDoneOn(h, TODAY)).toBe(true);
    expect(isDoneOn(h, '2026-09-04')).toBe(false);
  });
});

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    const h = habit({ completions: ['2026-09-03', '2026-09-04', TODAY] });
    expect(currentStreak(h, TODAY)).toBe(3);
  });

  it('keeps the streak alive when only yesterday is done', () => {
    const h = habit({ completions: ['2026-09-02', '2026-09-03', '2026-09-04'] });
    expect(currentStreak(h, TODAY)).toBe(3);
  });

  it('is 0 after a gap of two or more days', () => {
    const h = habit({ completions: ['2026-09-01', '2026-09-02', '2026-09-03'] });
    expect(currentStreak(h, TODAY)).toBe(0);
  });

  it('ignores completions separated by a gap before today', () => {
    const h = habit({ completions: ['2026-09-01', '2026-09-02', '2026-09-04', TODAY] });
    expect(currentStreak(h, TODAY)).toBe(2);
  });

  it('is 0 with no completions', () => {
    expect(currentStreak(habit(), TODAY)).toBe(0);
  });

  it('spans a month boundary', () => {
    const h = habit({ completions: ['2026-08-30', '2026-08-31', '2026-09-01'] });
    expect(currentStreak(h, '2026-09-01')).toBe(3);
  });
});

describe('bestStreak', () => {
  it('finds the longest run ever', () => {
    const h = habit({
      completions: ['2026-08-01', '2026-08-02', '2026-08-10', '2026-08-11', '2026-08-12', '2026-09-01'],
    });
    expect(bestStreak(h)).toBe(3);
  });

  it('returns 0 for empty and 1 for a single day', () => {
    expect(bestStreak(habit())).toBe(0);
    expect(bestStreak(habit({ completions: [TODAY] }))).toBe(1);
  });

  it('spans month boundaries', () => {
    expect(bestStreak(habit({ completions: ['2026-08-31', '2026-09-01'] }))).toBe(2);
  });
});

describe('weekStrip', () => {
  it('returns 7 entries oldest to today with labels', () => {
    const strip = weekStrip(habit({ completions: ['2026-08-30', TODAY] }), TODAY);
    expect(strip).toHaveLength(7);
    expect(strip.map((d) => d.date)).toEqual([
      '2026-08-30',
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ]);
    expect(strip[0]).toMatchObject({ done: true, isToday: false, dayOfMonth: 30, weekday: 'Sun' });
    expect(strip[6]).toMatchObject({ done: true, isToday: true, dayOfMonth: 5, weekday: 'Sat' });
    expect(strip[3]?.done).toBe(false);
  });
});

describe('dayProgress', () => {
  it('counts eligible habits done on the day', () => {
    const habits = [habit({ completions: [TODAY] }), habit({ id: 'h2' })];
    expect(dayProgress(habits, TODAY)).toEqual({ done: 1, total: 2, ratio: 0.5 });
  });

  it('returns ratio 0 when total is 0', () => {
    expect(dayProgress([], TODAY)).toEqual({ done: 0, total: 0, ratio: 0 });
  });

  it('excludes habits created after the day', () => {
    const habits = [
      habit({ createdAt: '2026-09-04' }),
      habit({ id: 'h2', createdAt: '2026-09-01', completions: ['2026-09-02'] }),
    ];
    expect(dayProgress(habits, '2026-09-02')).toEqual({ done: 1, total: 1, ratio: 1 });
  });
});

describe('habitStats', () => {
  it('bundles streaks, doneCount and weekStrip', () => {
    const stats = habitStats(habit({ completions: ['2026-09-04', TODAY] }), TODAY);
    expect(stats.currentStreak).toBe(2);
    expect(stats.bestStreak).toBe(2);
    expect(stats.doneCount).toBe(2);
    expect(stats.weekStrip).toHaveLength(7);
  });
});

describe('overallStats', () => {
  it('returns zeros and null for no habits', () => {
    expect(overallStats([], TODAY)).toEqual({
      totalCompletions: 0,
      bestStreakHabit: null,
      perfectDays7: 0,
      completionRate7: 0,
    });
  });

  it('computes perfect days and completion rate over the 7-day window', () => {
    const habits = [
      habit({ id: 'a', completions: ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'] }),
      habit({ id: 'b', completions: ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02'] }),
    ];
    const stats = overallStats(habits, TODAY);
    expect(stats.totalCompletions).toBe(10);
    expect(stats.perfectDays7).toBe(4);
    expect(stats.completionRate7).toBeCloseTo(10 / 14);
  });

  it('does not count completions outside the window', () => {
    const habits = [habit({ completions: ['2026-08-01', '2026-08-29'] })];
    const stats = overallStats(habits, TODAY);
    expect(stats.totalCompletions).toBe(2);
    expect(stats.completionRate7).toBe(0);
    expect(stats.perfectDays7).toBe(0);
  });

  it('only counts days with at least one eligible habit as perfect', () => {
    const habits = [habit({ createdAt: '2026-09-04', completions: ['2026-09-04', TODAY] })];
    const stats = overallStats(habits, TODAY);
    expect(stats.perfectDays7).toBe(2);
    expect(stats.completionRate7).toBe(1);
  });

  it('picks the first habit in list order on a best-streak tie', () => {
    const habits = [
      habit({ id: 'a', name: 'A', completions: ['2026-09-01', '2026-09-02'] }),
      habit({ id: 'b', name: 'B', completions: ['2026-09-03', '2026-09-04'] }),
    ];
    expect(overallStats(habits, TODAY).bestStreakHabit).toEqual({ id: 'a', name: 'A', emoji: '📚', bestStreak: 2 });
  });

  it('prefers a strictly longer streak later in the list', () => {
    const habits = [
      habit({ id: 'a', completions: ['2026-09-01'] }),
      habit({ id: 'b', name: 'B', emoji: '🚶', completions: ['2026-09-02', '2026-09-03', '2026-09-04'] }),
    ];
    expect(overallStats(habits, TODAY).bestStreakHabit).toMatchObject({ id: 'b', bestStreak: 3 });
  });

  it('returns null bestStreakHabit when the max is 0', () => {
    expect(overallStats([habit(), habit({ id: 'b' })], TODAY).bestStreakHabit).toBeNull();
  });
});

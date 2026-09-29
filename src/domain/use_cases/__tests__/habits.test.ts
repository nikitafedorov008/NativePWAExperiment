import { describe, expect, it } from 'vitest';
import {
  addHabit,
  bestStreak,
  currentStreak,
  getDayProgress,
  getHabitStats,
  getOverallStats,
  isDoneOn,
  removeHabit,
  renameHabit,
  seedHabits,
  toggleCompletion,
} from '../habits.ts';
import type { HabitsStore } from '../habits.ts';
import { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH, normalizeName } from '../../models/habit.ts';
import type { Habit } from '../../models/habit.ts';

const TODAY = '2026-09-05';

const habit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'h1',
  name: 'Read',
  emoji: '📚',
  createdAt: '2026-08-23',
  completions: [],
  ...overrides,
});

/** Minimal in-memory stand-in for HabitsRepository. */
function makeStore(initial: Habit[] = [habit()]): HabitsStore & { current: () => Habit[]; persisted: number } {
  let habits = initial;
  let persisted = 0;
  return {
    get habits() {
      return habits;
    },
    replace(next: Habit[]) {
      habits = next;
    },
    persist() {
      persisted += 1;
    },
    current: () => habits,
    get persisted() {
      return persisted;
    },
  };
}

describe('habit model', () => {
  it('exposes the presets and defaults the forms rely on', () => {
    expect(NAME_MAX_LENGTH).toBe(40);
    expect(DEFAULT_EMOJI).toBe('✅');
    expect([...EMOJI_PRESETS]).toHaveLength(12);
  });

  it('normalizes names and rejects blank ones', () => {
    expect(normalizeName('  Drink   \t water \n')).toBe('Drink water');
    expect(normalizeName('a'.repeat(60))).toHaveLength(NAME_MAX_LENGTH);
    expect(normalizeName('   ')).toBe('');
    expect(normalizeName(null)).toBe('');
  });
});

describe('write use cases', () => {
  it('adds a habit and reports success', () => {
    const store = makeStore([]);
    const result = addHabit(store, { name: '  Walk ', emoji: '🚶' }, TODAY);
    expect(result.ok).toBe(true);
    expect(store.current()).toHaveLength(1);
    expect(store.current()[0]).toMatchObject({ name: 'Walk', emoji: '🚶', createdAt: TODAY });
    expect(store.persisted).toBe(1);
  });

  it('rejects an empty name without touching the store', () => {
    const store = makeStore([]);
    const result = addHabit(store, { name: '   ' }, TODAY);
    expect(result).toEqual({ ok: false, error: 'empty-name' });
    expect(store.current()).toHaveLength(0);
  });

  it('renames a habit and falls back to the existing emoji', () => {
    const store = makeStore();
    const result = renameHabit(store, 'h1', { name: '  Read more ' });
    expect(result.ok).toBe(true);
    expect(store.current()[0]).toMatchObject({ name: 'Read more', emoji: '📚' });
  });

  it('refuses unknown ids', () => {
    const store = makeStore();
    expect(renameHabit(store, 'nope', { name: 'x' })).toEqual({ ok: false, error: 'unknown-habit' });
    expect(removeHabit(store, 'nope')).toEqual({ ok: false, error: 'unknown-habit' });
    expect(toggleCompletion(store, 'nope', TODAY, TODAY)).toEqual({ ok: false, error: 'unknown-habit' });
  });

  it('removes a habit', () => {
    const store = makeStore([habit(), habit({ id: 'h2' })]);
    expect(removeHabit(store, 'h1').ok).toBe(true);
    expect(store.current().map((h) => h.id)).toEqual(['h2']);
  });

  it('toggles completions on and off, keeping them sorted', () => {
    const store = makeStore([habit({ completions: ['2026-09-03'] })]);
    expect(toggleCompletion(store, 'h1', '2026-09-01', TODAY).ok).toBe(true);
    expect(toggleCompletion(store, 'h1', '2026-09-02', TODAY).ok).toBe(true);
    expect(store.current()[0]?.completions).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
    expect(toggleCompletion(store, 'h1', '2026-09-02', TODAY).ok).toBe(true);
    expect(store.current()[0]?.completions).toEqual(['2026-09-01', '2026-09-03']);
  });

  it('rejects malformed and future dates', () => {
    const store = makeStore();
    expect(toggleCompletion(store, 'h1', 'tomorrow', TODAY)).toEqual({ ok: false, error: 'invalid-date' });
    expect(toggleCompletion(store, 'h1', '2026-09-06', TODAY)).toEqual({ ok: false, error: 'future-date' });
    expect(store.persisted).toBe(0);
  });

  it('allows completing a day before the habit was created', () => {
    const store = makeStore();
    expect(toggleCompletion(store, 'h1', '2026-08-20', TODAY).ok).toBe(true);
    expect(store.current()[0]?.completions).toEqual(['2026-08-20']);
  });
});

describe('read models', () => {
  it('checks membership', () => {
    const h = habit({ completions: [TODAY] });
    expect(isDoneOn(h, TODAY)).toBe(true);
    expect(isDoneOn(h, '2026-09-04')).toBe(false);
  });

  it('counts a streak ending today, or yesterday when today is open', () => {
    expect(currentStreak(habit({ completions: ['2026-09-03', '2026-09-04', TODAY] }), TODAY)).toBe(3);
    expect(currentStreak(habit({ completions: ['2026-09-02', '2026-09-03', '2026-09-04'] }), TODAY)).toBe(3);
    expect(currentStreak(habit({ completions: ['2026-09-01', '2026-09-02', '2026-09-03'] }), TODAY)).toBe(0);
    expect(currentStreak(habit(), TODAY)).toBe(0);
  });

  it('finds the best run ever', () => {
    expect(
      bestStreak(
        habit({ completions: ['2026-08-01', '2026-08-02', '2026-08-10', '2026-08-11', '2026-08-12'] }),
      ),
    ).toBe(3);
    expect(bestStreak(habit({ completions: ['2026-08-31', '2026-09-01'] }))).toBe(2);
    expect(bestStreak(habit())).toBe(0);
  });

  it('builds a presentation-ready habit view', () => {
    const stats = getHabitStats(habit({ completions: ['2026-09-04', TODAY] }), TODAY);
    expect(stats.doneToday).toBe(true);
    expect(stats.currentStreak).toBe(2);
    expect(stats.doneCount).toBe(2);
    expect(stats.weekStrip).toHaveLength(7);
    expect(stats.weekStrip[6]).toMatchObject({ date: TODAY, isToday: true, done: true, dayOfMonth: 5 });
  });

  it('counts eligible habits for a day', () => {
    const habits = [habit({ completions: [TODAY] }), habit({ id: 'h2' })];
    expect(getDayProgress(habits, TODAY)).toEqual({ done: 1, total: 2, ratio: 0.5 });
    expect(getDayProgress([], TODAY)).toEqual({ done: 0, total: 0, ratio: 0 });
    expect(getDayProgress([habit({ createdAt: '2026-09-04' })], '2026-09-02')).toEqual({
      done: 0,
      total: 0,
      ratio: 0,
    });
  });

  it('summarizes the seven-day window', () => {
    const habits = [
      habit({
        id: 'a',
        completions: ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'],
      }),
      habit({ id: 'b', completions: ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02'] }),
    ];
    const overall = getOverallStats(habits, TODAY);
    expect(overall.totalCompletions).toBe(10);
    expect(overall.perfectDays7).toBe(4);
    expect(overall.completionRate7).toBeCloseTo(10 / 14);
    expect(overall.bestStreakHabit).toEqual({ id: 'a', name: 'Read', emoji: '📚', bestStreak: 6 });
  });

  it('returns null for an empty best streak', () => {
    expect(getOverallStats([], TODAY)).toEqual({
      totalCompletions: 0,
      bestStreakHabit: null,
      perfectDays7: 0,
      completionRate7: 0,
    });
  });
});

describe('seedHabits', () => {
  const seed = seedHabits(TODAY);

  it('creates the four demo habits with a two-week history', () => {
    expect(seed.map((h) => [h.emoji, h.name])).toEqual([
      ['💧', 'Drink water'],
      ['📚', 'Read 20 min'],
      ['🚶', 'Walk 10k steps'],
      ['🧘', 'Meditate'],
    ]);
    seed.forEach((h) => expect(h.createdAt).toBe('2026-08-23'));
    seed.forEach((h) => {
      h.completions.forEach((key) => expect(key < TODAY).toBe(true));
      expect([...h.completions].sort()).toEqual(h.completions);
    });
  });

  it('is deterministic apart from ids', () => {
    expect(new Set(seed.map((h) => h.id)).size).toBe(4);
    const again = seedHabits(TODAY);
    expect(again.map((h) => h.completions)).toEqual(seed.map((h) => h.completions));
  });
});

describe('persist calls', () => {
  it('persists exactly once per successful write', () => {
    const store = makeStore();
    addHabit(store, { name: 'New' }, TODAY);
    toggleCompletion(store, 'h1', TODAY, TODAY);
    renameHabit(store, 'h1', { name: 'Renamed' });
    removeHabit(store, 'h1');
    expect(store.persisted).toBe(4);
  });
});

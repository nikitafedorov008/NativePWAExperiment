import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EMOJI,
  EMOJI_PRESETS,
  NAME_MAX_LENGTH,
  completionToggled,
  createHabit,
  habitAdded,
  habitRemoved,
  habitRenamed,
  habitsReducer,
  habitsReplaced,
  normalizeName,
} from '../model.ts';
import type { Habit, HabitAction } from '../model.ts';

const TODAY = '2026-09-05';

const habit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'h1',
  name: 'Read',
  emoji: '📚',
  createdAt: '2026-09-01',
  completions: [],
  ...overrides,
});

describe('constants', () => {
  it('exposes presets and defaults', () => {
    expect(NAME_MAX_LENGTH).toBe(40);
    expect(DEFAULT_EMOJI).toBe('✅');
    expect([...EMOJI_PRESETS]).toEqual(['💧', '📚', '🚶', '🧘', '🏃', '💪', '🥗', '😴', '✍️', '🎸', '🧹', '💊']);
  });
});

describe('normalizeName', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeName('  Drink   \t water \n')).toBe('Drink water');
  });

  it('caps at NAME_MAX_LENGTH', () => {
    expect(normalizeName('a'.repeat(60))).toHaveLength(NAME_MAX_LENGTH);
  });

  it('returns empty string for blank or nullish input', () => {
    expect(normalizeName('   ')).toBe('');
    expect(normalizeName(null)).toBe('');
    expect(normalizeName(undefined)).toBe('');
  });
});

describe('createHabit', () => {
  it('normalizes name, falls back to DEFAULT_EMOJI and starts empty', () => {
    const h = createHabit({ name: '  Walk  ', emoji: '', createdAt: TODAY });
    expect(h.name).toBe('Walk');
    expect(h.emoji).toBe(DEFAULT_EMOJI);
    expect(h.createdAt).toBe(TODAY);
    expect(h.completions).toEqual([]);
    expect(typeof h.id).toBe('string');
    expect(h.id.length).toBeGreaterThan(0);
  });

  it('generates unique ids', () => {
    const a = createHabit({ name: 'a', emoji: '💧', createdAt: TODAY });
    const b = createHabit({ name: 'b', emoji: '💧', createdAt: TODAY });
    expect(a.id).not.toBe(b.id);
  });
});

describe('habitsReducer', () => {
  it('adds habits in insertion order', () => {
    const state = habitsReducer([habit()], habitAdded(habit({ id: 'h2', name: 'Walk' })));
    expect(state.map((h) => h.id)).toEqual(['h1', 'h2']);
  });

  it('renames and updates emoji', () => {
    const state = habitsReducer([habit()], habitRenamed('h1', { name: '  Read more ', emoji: '🎸' }));
    expect(state[0]).toMatchObject({ name: 'Read more', emoji: '🎸' });
  });

  it('ignores rename with an empty name or unknown id', () => {
    const initial = [habit()];
    expect(habitsReducer(initial, habitRenamed('h1', { name: '   ', emoji: '🎸' }))).toBe(initial);
    expect(habitsReducer(initial, habitRenamed('nope', { name: 'x', emoji: '🎸' }))).toBe(initial);
  });

  it('falls back to DEFAULT_EMOJI when renaming with an empty emoji', () => {
    const state = habitsReducer([habit()], habitRenamed('h1', { name: 'Read', emoji: '' }));
    expect(state[0]?.emoji).toBe(DEFAULT_EMOJI);
  });

  it('removes a habit and is a no-op for unknown ids', () => {
    const initial = [habit(), habit({ id: 'h2' })];
    expect(habitsReducer(initial, habitRemoved('h1')).map((h) => h.id)).toEqual(['h2']);
    expect(habitsReducer(initial, habitRemoved('zzz'))).toBe(initial);
  });

  it('toggles a completion on and off (idempotent per id+date)', () => {
    const on = habitsReducer([habit()], completionToggled('h1', TODAY, TODAY));
    expect(on[0]?.completions).toEqual([TODAY]);
    const off = habitsReducer(on, completionToggled('h1', TODAY, TODAY));
    expect(off[0]?.completions).toEqual([]);
  });

  it('keeps completions sorted and unique', () => {
    let state = [habit({ completions: ['2026-09-03'] })];
    state = habitsReducer(state, completionToggled('h1', '2026-09-01', TODAY));
    state = habitsReducer(state, completionToggled('h1', '2026-09-02', TODAY));
    expect(state[0]?.completions).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
  });

  it('rejects future dates', () => {
    const initial = [habit()];
    expect(habitsReducer(initial, completionToggled('h1', '2026-09-06', TODAY))).toBe(initial);
  });

  it('allows dates before createdAt', () => {
    const state = habitsReducer([habit()], completionToggled('h1', '2026-08-20', TODAY));
    expect(state[0]?.completions).toEqual(['2026-08-20']);
  });

  it('rejects malformed date keys and unknown ids', () => {
    const initial = [habit()];
    expect(habitsReducer(initial, completionToggled('h1', 'tomorrow', TODAY))).toBe(initial);
    expect(habitsReducer(initial, completionToggled('h9', TODAY, TODAY))).toBe(initial);
  });

  it('replaces the whole list', () => {
    const next = [habit({ id: 'x' })];
    expect(habitsReducer([habit()], habitsReplaced(next))).toBe(next);
  });

  it('returns the same state for unknown actions', () => {
    const initial = [habit()];
    expect(habitsReducer(initial, { type: 'nope' } as unknown as HabitAction)).toBe(initial);
  });
});

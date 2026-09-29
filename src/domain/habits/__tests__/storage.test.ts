import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { addDays } from '../dates.ts';
import { clearHabits, loadHabits, saveHabits, seedHabits } from '../storage.ts';

const TODAY = '2026-09-05';
const KEY = 'streaks.habits.v1';

type MinimalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

class MemoryStorage implements MinimalStorage {
  #map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.#map.has(key) ? (this.#map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.#map.set(key, String(value));
  }
  removeItem(key: string): void {
    this.#map.delete(key);
  }
}

const setStorage = (storage: MinimalStorage | undefined): void => {
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
};

describe('seedHabits', () => {
  const seed = seedHabits(TODAY);

  it('creates 4 habits in the specified order with createdAt = today-13', () => {
    expect(seed.map((h) => [h.emoji, h.name])).toEqual([
      ['💧', 'Drink water'],
      ['📚', 'Read 20 min'],
      ['🚶', 'Walk 10k steps'],
      ['🧘', 'Meditate'],
    ]);
    seed.forEach((h) => expect(h.createdAt).toBe('2026-08-23'));
    expect(new Set(seed.map((h) => h.id)).size).toBe(4);
  });

  it('matches the exact completion pattern', () => {
    const d = (n: number): string => addDays(TODAY, n);
    expect(seed[0]?.completions).toEqual([d(-6), d(-5), d(-4), d(-3), d(-2), d(-1)]);
    expect(seed[1]?.completions).toEqual([d(-6), d(-5), d(-4), d(-3)]);
    expect(seed[2]?.completions).toEqual([d(-6), d(-4), d(-2)]);
    expect(seed[3]?.completions).toEqual([d(-1)]);
  });

  it('never includes today or future keys and keeps keys sorted', () => {
    seed.forEach((h) => {
      h.completions.forEach((key) => expect(key < TODAY).toBe(true));
      expect([...h.completions].sort()).toEqual(h.completions);
    });
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => {
    setStorage(new MemoryStorage());
  });
  afterEach(() => {
    setStorage(undefined);
  });

  it('returns null when nothing is stored', () => {
    expect(loadHabits()).toBeNull();
  });

  it('round-trips habits with the versioned envelope', () => {
    const habits = seedHabits(TODAY);
    saveHabits(habits);
    const raw = localStorage.getItem(KEY);
    expect(raw).not.toBeNull();
    expect((JSON.parse(raw as string) as { version: number }).version).toBe(1);
    expect(loadHabits()).toEqual(habits);
  });

  it('returns null for corrupt or malformed payloads', () => {
    localStorage.setItem(KEY, '{not json');
    expect(loadHabits()).toBeNull();
    localStorage.setItem(KEY, JSON.stringify({ version: 2, habits: [] }));
    expect(loadHabits()).toBeNull();
    localStorage.setItem(KEY, JSON.stringify({ version: 1, habits: [{ id: 'x' }] }));
    expect(loadHabits()).toBeNull();
    localStorage.setItem(KEY, JSON.stringify({ version: 1, habits: 'nope' }));
    expect(loadHabits()).toBeNull();
  });

  it('clears the stored value', () => {
    saveHabits(seedHabits(TODAY));
    clearHabits();
    expect(loadHabits()).toBeNull();
  });

  it('survives a throwing storage', () => {
    setStorage({
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
    });
    expect(loadHabits()).toBeNull();
    expect(() => saveHabits([])).not.toThrow();
    expect(() => clearHabits()).not.toThrow();
  });
});

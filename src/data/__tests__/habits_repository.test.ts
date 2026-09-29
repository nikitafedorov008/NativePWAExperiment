import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHabitsRepository } from '../repositories/habits_repository.ts';
import { LocalStorageService } from '../services/local_storage_service.ts';
import { createClockService } from '../services/clock_service.ts';
import { fromEnvelope, toEnvelope, HABITS_STORAGE_KEY } from '../models/habit_dto.ts';
import { addHabit, toggleCompletion } from '../../domain/use_cases/habits.ts';
import type { Habit } from '../../domain/models/habit.ts';

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

describe('habit dto', () => {
  it('round-trips through the versioned envelope', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Read',
      emoji: '📚',
      createdAt: '2026-09-01',
      completions: ['2026-09-02'],
    };
    expect(fromEnvelope(toEnvelope([habit]))).toEqual([habit]);
  });

  it('rejects foreign versions, missing habits and malformed entries', () => {
    expect(fromEnvelope(null)).toBeNull();
    expect(fromEnvelope({ version: 2, habits: [] })).toBeNull();
    expect(fromEnvelope({ version: 1, habits: 'nope' })).toBeNull();
    expect(fromEnvelope({ version: 1, habits: [{ id: 'x' }] })).toBeNull();
    expect(
      fromEnvelope({
        version: 1,
        habits: [{ id: 'x', name: 'a', emoji: '💧', createdAt: 'nope', completions: [] }],
      }),
    ).toBeNull();
  });
});

describe('HabitsRepository', () => {
  let storage: LocalStorageService;
  let clock: ReturnType<typeof createClockService>;

  beforeEach(() => {
    setStorage(new MemoryStorage());
    storage = new LocalStorageService('streaks');
    clock = createClockService();
  });

  afterEach(() => {
    setStorage(undefined);
  });

  it('seeds demo habits on first run and persists them', () => {
    const repo = createHabitsRepository(storage, clock);
    repo.load();
    expect(repo.store.getState().habits).toHaveLength(4);
    expect(storage.read<unknown>(HABITS_STORAGE_KEY)).not.toBeNull();
  });

  it('restores what was stored instead of seeding again', () => {
    const first = createHabitsRepository(storage, clock);
    first.load();
    addHabit(first, { name: 'Only one' }, clock.getState().today);

    const second = createHabitsRepository(storage, clock);
    second.load();
    expect(second.store.getState().habits.map((h) => h.name)).toEqual(
      first.store.getState().habits.map((h) => h.name),
    );
    expect(second.store.getState().habits.map((h) => h.name)).toContain('Only one');
  });

  it('notifies subscribers when a write changes the list', () => {
    const repo = createHabitsRepository(storage, clock);
    repo.load();
    let notified = 0;
    const unsubscribe = repo.store.subscribe(() => {
      notified += 1;
    });
    toggleCompletion(repo, repo.store.getState().habits[0]!.id, clock.getState().today, clock.getState().today);
    expect(notified).toBe(1);
    expect(repo.store.getState().today).toBe(clock.getState().today);
    unsubscribe();
  });

  it('starts again from the demo set on reset', () => {
    const repo = createHabitsRepository(storage, clock);
    repo.load();
    addHabit(repo, { name: 'Extra' }, clock.getState().today);
    repo.reset();
    expect(repo.store.getState().habits).toHaveLength(4);
  });

  it('follows the clock when the day changes', () => {
    const repo = createHabitsRepository(storage, clock);
    repo.load();
    clock.setState({ today: '2030-01-01' });
    expect(repo.store.getState().today).toBe('2030-01-01');
  });

  it('survives a storage that throws', () => {
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
    const repo = createHabitsRepository(new LocalStorageService('streaks'), clock);
    expect(() => repo.load()).not.toThrow();
    expect(repo.store.getState().habits).toHaveLength(4);
  });
});

/**
 * The one test that exercises the whole chain outside React: view → command →
 * use case → repository → store → view model state.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createTodayViewModel } from '../today_view_model.ts';
import { createHabitsRepository } from '../../../../data/repositories/habits_repository.ts';
import { LocalStorageService } from '../../../../data/services/local_storage_service.ts';
import { createClockService } from '../../../../data/services/clock_service.ts';

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

const celebration = () => {
  let count = 0;
  return { celebrate: () => void (count += 1), get count() { return count; } };
};

describe('TodayViewModel', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
  });

  const build = () => {
    const storage = new LocalStorageService('streaks');
    const clock = createClockService();
    const habits = createHabitsRepository(storage, clock);
    habits.load();
    const party = celebration();
    const vm = createTodayViewModel({ habits, celebration: party });
    return { vm, habits, clock, party };
  };

  it('exposes presentation-ready items for every habit', () => {
    const { vm } = build();
    const { items, progress } = vm.getState();
    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({ name: 'Drink water', doneToday: false });
    expect(items[0]?.days).toHaveLength(7);
    expect(progress).toEqual({ done: 0, total: 4, ratio: 0 });
  });

  it('republishes when a habit is toggled through the use case', () => {
    const { vm, habits } = build();
    const id = vm.getState().items[0]!.id;
    vm.getState().toggleToday(id);
    expect(vm.getState().items[0]?.doneToday).toBe(true);
    expect(vm.getState().progress.done).toBe(1);
    expect(habits.store.getState().habits[0]?.completions).toHaveLength(7);
  });

  it('celebrates only when the day becomes complete', () => {
    const { vm, party } = build();
    const ids = vm.getState().items.map((item) => item.id);
    ids.slice(0, 3).forEach((id) => vm.getState().toggleToday(id));
    expect(party.count).toBe(0);
    vm.getState().toggleToday(ids[3]!);
    expect(party.count).toBe(1);
  });

  it('opens the editor by id and adds a habit through the command', () => {
    const { vm } = build();
    vm.getState().openEditor(null);
    expect(vm.getState().editor.open).toBe(true);
    expect(vm.getState().editor.habit).toBeNull();
    expect(vm.getState().submitEditor({ name: '  Stretch ', emoji: '🧘' })).toBe(true);
    expect(vm.getState().editor.open).toBe(false);
    expect(vm.getState().items.map((i) => i.name)).toContain('Stretch');
  });

  it('keeps the editor open when the input is rejected', () => {
    const { vm } = build();
    vm.getState().openEditor(null);
    expect(vm.getState().submitEditor({ name: '   ' })).toBe(false);
    expect(vm.getState().editor.open).toBe(true);
  });

  it('renames and removes through the same store', () => {
    const { vm } = build();
    const id = vm.getState().items[0]!.id;
    vm.getState().openEditor(id);
    expect(vm.getState().editor.habit?.id).toBe(id);
    expect(vm.getState().submitEditor({ name: 'Drink more water' })).toBe(true);
    expect(vm.getState().items[0]?.name).toBe('Drink more water');

    vm.getState().remove(id);
    expect(vm.getState().items).toHaveLength(3);
  });
});

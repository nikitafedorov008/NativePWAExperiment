/**
 * data/services/clock_service — "what day is it" as a small zustand store.
 *
 * A habit tracker lives or dies by its notion of today, and an installed PWA can
 * stay open across midnight. The service owns that: the store holds the current
 * local date key, and `start()` re-checks it at midnight, on window focus and
 * when a hidden tab becomes visible again.
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';
import { msUntilNextMidnight, todayKey } from '../../utils/dates.ts';
import type { DateKey } from '../../domain/models/habit.ts';

const MIDNIGHT_SLACK_MS = 1000;

export interface ClockState {
  today: DateKey;
}

export type ClockStore = StoreApi<ClockState>;

export type ClockService = ClockStore & {
  start(): void;
  stop(): void;
};

export function createClockService(): ClockService {
  const store = createStore<ClockState>(() => ({ today: todayKey() }));
  let timer: ReturnType<typeof setTimeout> | null = null;
  let onVisibility: (() => void) | null = null;
  let onFocus: (() => void) | null = null;

  const refresh = (): void => {
    const next = todayKey();
    if (next !== store.getState().today) store.setState({ today: next });
  };

  const schedule = (): void => {
    timer = setTimeout(() => {
      refresh();
      schedule();
    }, msUntilNextMidnight() + MIDNIGHT_SLACK_MS);
  };

  return Object.assign(store, {
    start(): void {
      if (typeof document === 'undefined' || timer) return;
      onVisibility = (): void => {
        if (document.visibilityState === 'visible') refresh();
      };
      onFocus = refresh;
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('focus', onFocus);
      schedule();
    },
    stop(): void {
      if (timer) clearTimeout(timer);
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
      if (onFocus) window.removeEventListener('focus', onFocus);
      timer = null;
    },
  });
}

/**
 * data/services/clock_service — "what day is it" plus a rollover signal.
 *
 * A habit tracker lives or dies by its notion of today, and an installed PWA
 * can stay open across midnight. The service owns that: it exposes the current
 * local date key and notifies listeners when the day changes (timer at
 * midnight, window focus, returning to a visible tab).
 */
import { msUntilNextMidnight, todayKey } from '../../utils/dates.ts';
import type { DateKey } from '../../domain/models/habit.ts';
import { ChangeNotifier } from '../../core/change_notifier.ts';

const MIDNIGHT_SLACK_MS = 1000;

export class ClockService extends ChangeNotifier {
  #today: DateKey = todayKey();
  #timer: ReturnType<typeof setTimeout> | null = null;
  #onVisibility: (() => void) | null = null;
  #onFocus: (() => void) | null = null;

  get today(): DateKey {
    return this.#today;
  }

  /** Starts watching for rollovers; call once from the composition root. */
  start(): void {
    if (typeof document === 'undefined') return;
    const refresh = (): void => {
      const next = todayKey();
      if (next === this.#today) return;
      this.#today = next;
      this.notifyListeners();
    };
    const schedule = (): void => {
      this.#timer = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextMidnight() + MIDNIGHT_SLACK_MS);
    };
    this.#onVisibility = (): void => {
      if (document.visibilityState === 'visible') refresh();
    };
    this.#onFocus = refresh;
    document.addEventListener('visibilitychange', this.#onVisibility);
    window.addEventListener('focus', this.#onFocus);
    schedule();
  }

  stop(): void {
    if (this.#timer) clearTimeout(this.#timer);
    if (this.#onVisibility) document.removeEventListener('visibilitychange', this.#onVisibility);
    if (this.#onFocus) window.removeEventListener('focus', this.#onFocus);
    this.#timer = null;
  }
}

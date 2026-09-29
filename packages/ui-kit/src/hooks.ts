/**
 * hooks.ts — the kit's React binding to the host's observables, the equivalent
 * of Flutter's `ListenableBuilder`: a view re-renders when the view model's
 * state changes, and never subscribes by itself.
 */
import { useSyncExternalStore } from 'react';
import type { Observable } from './types.ts';

export function useObservable<T>(observable: Observable<T>): T {
  return useSyncExternalStore(
    observable.subscribe,
    () => observable.state,
    () => observable.state,
  );
}

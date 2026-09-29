/**
 * ui/core/hooks — the bridge between our ChangeNotifier primitives and React,
 * the equivalent of Flutter's `ListenableBuilder`. Views never subscribe
 * themselves; they read the immutable snapshot a view model publishes.
 */
import { useSyncExternalStore } from 'react';
import type { ChangeNotifier } from '../../core/change_notifier.ts';

export interface Observable<T> extends ChangeNotifier {
  readonly state: T;
}

/** Re-renders the calling component whenever the observable's state changes. */
export function useNotifier<T>(observable: Observable<T>): T {
  return useSyncExternalStore(
    observable.subscribe,
    () => observable.state,
    () => observable.state,
  );
}

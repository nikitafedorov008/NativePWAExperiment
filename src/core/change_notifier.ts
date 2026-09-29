/**
 * core/change_notifier — the framework primitive Flutter calls
 * `ChangeNotifier`: a tiny observable that owns mutable state and tells
 * listeners when it changed. Repositories and view models extend it; the UI
 * subscribes through `useNotifier` (src/ui/core/hooks.ts), which is the
 * equivalent of Flutter's `ListenableBuilder`.
 *
 * Subclasses expose an immutable snapshot (`get state`) and replace it on every
 * change, so React's `useSyncExternalStore` sees a stable identity between
 * notifications.
 */
export class ChangeNotifier {
  #listeners = new Set<() => void>();

  addListener(listener: () => void): void {
    this.#listeners.add(listener);
  }

  removeListener(listener: () => void): void {
    this.#listeners.delete(listener);
  }

  subscribe = (listener: () => void): (() => void) => {
    this.addListener(listener);
    return () => this.removeListener(listener);
  };

  protected notifyListeners(): void {
    this.#listeners.forEach((listener) => listener());
  }

  dispose(): void {
    this.#listeners.clear();
  }
}

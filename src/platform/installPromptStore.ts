/**
 * Framework-agnostic store for the beforeinstallprompt event, kept outside
 * React so any UI kit can subscribe (useSyncExternalStore) to the same
 * install flow: capture the prompt, call prompt(), surface the outcome.
 */

export type InstallOutcome = 'accepted' | 'dismissed';

/** Chrome's non-standard event, still not in lib.dom. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
  prompt(): Promise<void>;
}

export interface InstallSnapshot {
  event: BeforeInstallPromptEvent | null;
  installed: boolean;
  outcome: InstallOutcome | null;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: InstallSnapshot = { event: null, installed: false, outcome: null };

const update = (patch: Partial<InstallSnapshot>): void => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    update({ event: event as BeforeInstallPromptEvent });
  });
  window.addEventListener('appinstalled', () => update({ event: null, installed: true }));
}

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getSnapshot = (): InstallSnapshot => snapshot;

export const clearEvent = (): void => update({ event: null });

export const setOutcome = (outcome: InstallOutcome): void => update({ outcome });

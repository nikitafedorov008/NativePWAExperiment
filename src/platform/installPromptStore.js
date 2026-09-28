/**
 * Framework-agnostic store for the beforeinstallprompt event, kept outside
 * React so any UI kit can subscribe (useSyncExternalStore) to the same
 * install flow: capture the prompt, call prompt(), surface the outcome.
 */
const listeners = new Set();
let snapshot = { event: null, installed: false, outcome: null };

const update = (patch) => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    update({ event });
  });
  window.addEventListener('appinstalled', () => update({ event: null, installed: true }));
}

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getSnapshot = () => snapshot;

export const clearEvent = () => update({ event: null });

export const setOutcome = (outcome) => update({ outcome });

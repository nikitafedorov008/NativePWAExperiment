import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { installInstructions } from './detect.js';
import { clearEvent, getSnapshot, setOutcome, subscribe } from './installPromptStore.js';
import { usePlatform } from './PlatformContext.jsx';

const DISMISS_KEY = 'streaks.installBannerDismissed';
const dismissListeners = new Set();

const safely = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

let dismissedSnapshot = safely(() => localStorage.getItem(DISMISS_KEY)) === '1';

const writeDismissed = (value) => {
  safely(() => (value ? localStorage.setItem(DISMISS_KEY, '1') : localStorage.removeItem(DISMISS_KEY)));
  dismissedSnapshot = value;
  dismissListeners.forEach((listener) => listener());
};

const subscribeDismissed = (listener) => {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
};

const getDismissed = () => dismissedSnapshot;

export function useInstallPrompt() {
  const { os, browser, installed: platformInstalled } = usePlatform();
  const { event, installed, outcome } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissed, getDismissed);

  const promptInstall = useCallback(async () => {
    if (!event) return 'unavailable';
    try {
      await event.prompt();
      const choice = await event.userChoice;
      setOutcome(choice.outcome);
      return choice.outcome;
    } catch {
      return 'unavailable';
    } finally {
      clearEvent();
    }
  }, [event]);

  const dismiss = useCallback(() => writeDismissed(true), []);
  const undismiss = useCallback(() => writeDismissed(false), []);
  const instructions = useMemo(() => installInstructions({ os, browser }), [os, browser]);

  return {
    canPrompt: event !== null,
    promptInstall,
    outcome,
    installed: platformInstalled || installed,
    dismissed,
    dismiss,
    undismiss,
    instructions,
  };
}

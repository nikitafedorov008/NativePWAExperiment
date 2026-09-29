/**
 * The install flow as a hook: the captured prompt, a dismissible banner state,
 * and per-browser fallback instructions for platforms without
 * beforeinstallprompt (notably iOS Safari).
 */
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { installInstructions } from './detect.ts';
import type { InstallInstructions } from './detect.ts';
import { clearEvent, getSnapshot, setOutcome, subscribe } from './installPromptStore.ts';
import type { InstallOutcome } from './installPromptStore.ts';
import { usePlatform } from './PlatformContext.tsx';

const DISMISS_KEY = 'streaks.installBannerDismissed';
const dismissListeners = new Set<() => void>();

const safely = <T>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

let dismissedSnapshot = safely(() => localStorage.getItem(DISMISS_KEY)) === '1';

const writeDismissed = (value: boolean): void => {
  safely(() => (value ? localStorage.setItem(DISMISS_KEY, '1') : localStorage.removeItem(DISMISS_KEY)));
  dismissedSnapshot = value;
  dismissListeners.forEach((listener) => listener());
};

const subscribeDismissed = (listener: () => void): (() => void) => {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
};

const getDismissed = (): boolean => dismissedSnapshot;

export interface InstallApi {
  canPrompt: boolean;
  promptInstall(): Promise<InstallOutcome | 'unavailable'>;
  outcome: InstallOutcome | null;
  installed: boolean;
  dismissed: boolean;
  dismiss(): void;
  undismiss(): void;
  instructions: InstallInstructions;
}

export function useInstallPrompt(): InstallApi {
  const { os, browser, installed: platformInstalled } = usePlatform();
  const { event, installed, outcome } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissed, getDismissed);

  const promptInstall = useCallback(async (): Promise<InstallOutcome | 'unavailable'> => {
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

  const dismiss = useCallback((): void => writeDismissed(true), []);
  const undismiss = useCallback((): void => writeDismissed(false), []);
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

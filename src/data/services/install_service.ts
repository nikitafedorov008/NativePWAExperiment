/**
 * data/services/install_service — captures `beforeinstallprompt` into a store.
 *
 * The event fires once, early, and cannot be re-created: the store keeps it so
 * any screen can trigger the prompt later, and records the user's answer.
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';

export type InstallOutcome = 'accepted' | 'dismissed';

/** Chrome's non-standard event, still missing from lib.dom. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
  prompt(): Promise<void>;
}

export interface InstallEventState {
  canPrompt: boolean;
  installed: boolean;
  outcome: InstallOutcome | null;
}

export type InstallService = StoreApi<InstallEventState> & {
  start(): void;
  prompt(): Promise<InstallOutcome | 'unavailable'>;
};

export function createInstallService(): InstallService {
  const store = createStore<InstallEventState>(() => ({
    canPrompt: false,
    installed: false,
    outcome: null,
  }));
  let event: BeforeInstallPromptEvent | null = null;
  let captured = false;

  const publish = (): void =>
    store.setState({ canPrompt: event !== null, installed: store.getState().installed, outcome: store.getState().outcome });

  return Object.assign(store, {
    /** Subscribes to the browser events once; safe to call repeatedly. */
    start(): void {
      if (captured || typeof window === 'undefined') return;
      captured = true;
      window.addEventListener('beforeinstallprompt', (raw) => {
        raw.preventDefault();
        event = raw as BeforeInstallPromptEvent;
        publish();
      });
      window.addEventListener('appinstalled', () => {
        event = null;
        store.setState({ canPrompt: false, installed: true });
      });
    },
    async prompt(): Promise<InstallOutcome | 'unavailable'> {
      if (!event) return 'unavailable';
      try {
        await event.prompt();
        const choice = await event.userChoice;
        store.setState({ outcome: choice.outcome });
        return choice.outcome;
      } catch {
        return 'unavailable';
      } finally {
        event = null;
        publish();
      }
    },
  });
}

/** Per-browser "how to install" steps, used where the prompt is unavailable. */
export interface InstallInstructions {
  title: string;
  steps: string[];
}

const IOS_SAFARI_STEPS = ['Tap the Share button', "Choose 'Add to Home Screen'", 'Tap Add'];
const CHROME_DESKTOP_STEPS = [
  'Click the install icon at the right of the address bar',
  'or open ⋮ → Cast, save, and share → Install page as app',
];
const EDGE_STEPS = [
  'Click the app icon in the address bar',
  'or ⋯ → Apps → Install this site as an app',
];

const OS_TITLES: Record<string, string> = {
  ios: 'Install on iPhone/iPad',
  macos: 'Install on Mac',
  android: 'Install on Android',
  windows: 'Install on Windows',
  linux: 'Install on Linux',
};

export function installInstructions(input: { os: string; browser: string }): InstallInstructions {
  const { os, browser } = input;
  const steps = (): string[] => {
    if (os === 'ios') {
      return browser === 'safari' ? IOS_SAFARI_STEPS : ['Open this page in Safari', ...IOS_SAFARI_STEPS];
    }
    if (os === 'android') {
      return browser === 'firefox'
        ? ['Open the menu (⋮)', "Choose 'Install' / 'Add to Home screen'"]
        : ['Open the browser menu (⋮)', "Choose 'Install app' or 'Add to Home screen'"];
    }
    if (os === 'macos' && browser === 'safari') {
      return ['Open the File menu', "Choose 'Add to Dock…'", 'Click Add'];
    }
    if (browser === 'chrome') return CHROME_DESKTOP_STEPS;
    if (browser === 'edge') return EDGE_STEPS;
    if (browser === 'firefox') {
      return os === 'windows'
        ? ["Firefox 142+: use 'Add to taskbar' in the address bar", 'or open this page in Chrome/Edge']
        : ["Firefox doesn't support installing web apps here", 'Open this page in Chrome or Edge to install'];
    }
    return ['Open this page in Chrome, Edge or Safari', "Use the browser's 'Install app' option"];
  };
  return { title: OS_TITLES[os] ?? 'Install the app', steps: steps() };
}

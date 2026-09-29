/**
 * data/services/install_service — captures `beforeinstallprompt`.
 *
 * The event fires once, early, and cannot be re-created: the service stores it
 * so any screen can trigger the prompt later, and reports the user's answer.
 */
import { ChangeNotifier } from '../../core/change_notifier.ts';

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

export class InstallService extends ChangeNotifier {
  #event: BeforeInstallPromptEvent | null = null;
  #installed = false;
  #outcome: InstallOutcome | null = null;
  #captured = false;
  #state: InstallEventState = { canPrompt: false, installed: false, outcome: null };

  get state(): InstallEventState {
    return this.#state;
  }

  /** Subscribes to the browser events once; safe to call repeatedly. */
  start(): void {
    if (this.#captured || typeof window === 'undefined') return;
    this.#captured = true;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.#event = event as BeforeInstallPromptEvent;
      this.#publish();
    });
    window.addEventListener('appinstalled', () => {
      this.#event = null;
      this.#installed = true;
      this.#publish();
    });
  }

  async prompt(): Promise<InstallOutcome | 'unavailable'> {
    const event = this.#event;
    if (!event) return 'unavailable';
    try {
      await event.prompt();
      const choice = await event.userChoice;
      this.#outcome = choice.outcome;
      return choice.outcome;
    } catch {
      return 'unavailable';
    } finally {
      this.#event = null;
      this.#publish();
    }
  }

  #publish(): void {
    this.#state = { canPrompt: this.#event !== null, installed: this.#installed, outcome: this.#outcome };
    this.notifyListeners();
  }
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

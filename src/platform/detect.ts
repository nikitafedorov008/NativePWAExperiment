/**
 * Pure detection helpers for the platform layer — no React, fully unit-tested.
 * UA parsing is only a fallback: userAgentData.platform is preferred where
 * available. installInstructions() powers the per-browser "how to install"
 * steps shown when beforeinstallprompt is unavailable (iOS Safari etc.).
 *
 * Which design language to render is decided by the ui-kit registry
 * (resolveDesignSystem), not here — this module only answers "what is this
 * device running?".
 */
import { isDesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import type { DesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';

export type OS = 'ios' | 'macos' | 'android' | 'windows' | 'linux' | 'unknown';
export type Browser = 'edge' | 'chrome' | 'safari' | 'firefox' | 'other';
export type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'window-controls-overlay' | 'browser';

export interface UserAgentInput {
  ua?: string;
  uaPlatform?: string;
  maxTouchPoints?: number;
}

const UA_PLATFORM_OS: Record<string, OS> = {
  Windows: 'windows',
  macOS: 'macos',
  Android: 'android',
  Linux: 'linux',
  'Chrome OS': 'linux',
  iOS: 'ios',
};

const DISPLAY_MODES: DisplayMode[] = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'];

export function detectOS({ ua = '', uaPlatform = '', maxTouchPoints = 0 }: UserAgentInput = {}): OS {
  const mapped = UA_PLATFORM_OS[uaPlatform];
  if (mapped) return mapped;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Macintosh/.test(ua) && maxTouchPoints > 1) return 'ios';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macos';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/CrOS|Linux/.test(ua)) return 'linux';
  return 'unknown';
}

export function detectBrowser({ ua = '' }: { ua?: string } = {}): Browser {
  if (/Edg\//.test(ua)) return 'edge';
  if (/Chrome\//.test(ua)) return 'chrome';
  if (/Safari\//.test(ua)) return 'safari';
  if (/Firefox\//.test(ua)) return 'firefox';
  return 'other';
}

export function detectDisplayMode(): DisplayMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'browser';
  return DISPLAY_MODES.find((mode) => window.matchMedia(`(display-mode: ${mode})`).matches) ?? 'browser';
}

export const isInstalled = (): boolean =>
  detectDisplayMode() !== 'browser' ||
  (typeof navigator !== 'undefined' && (navigator as Navigator & { standalone?: boolean }).standalone === true);

/**
 * Reads `?design=…`: a valid id wins, `auto`/empty clears the override, and
 * anything else (absent or unknown) keeps whatever is stored.
 */
export function readOverrideFromUrl(search: string = window.location.search): DesignSystem | null | undefined {
  const params = new URLSearchParams(search);
  if (!params.has('design')) return undefined;
  const value = params.get('design');
  if (isDesignSystem(value)) return value;
  return value === '' || value === 'auto' ? null : undefined;
}

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

const OS_TITLES: Partial<Record<OS, string>> = {
  ios: 'Install on iPhone/iPad',
  macos: 'Install on Mac',
  android: 'Install on Android',
  windows: 'Install on Windows',
  linux: 'Install on Linux',
};

function instructionSteps({ os, browser }: { os: OS; browser: Browser }): string[] {
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
}

export const installInstructions = ({ os, browser }: { os: OS; browser: Browser }): InstallInstructions => ({
  title: OS_TITLES[os] ?? 'Install the app',
  steps: instructionSteps({ os, browser }),
});

/**
 * Pure detection helpers for the platform layer — no React, fully unit-tested.
 * UA parsing is only a fallback: userAgentData.platform is preferred where
 * available. installInstructions() powers the per-browser "how to install"
 * steps shown when beforeinstallprompt is unavailable (iOS Safari etc.).
 */
export const DESIGN_SYSTEMS = ['web', 'cupertino', 'material', 'fluent'];

export const DESIGN_OPTIONS = [
  { value: null, label: 'Auto (detect)' },
  { value: 'web', label: 'Web · shadcn/ui' },
  { value: 'cupertino', label: 'Cupertino · iOS/macOS' },
  { value: 'material', label: 'Material · Android/Linux' },
  { value: 'fluent', label: 'Fluent · Windows' },
];

const UA_PLATFORM_OS = {
  Windows: 'windows',
  macOS: 'macos',
  Android: 'android',
  Linux: 'linux',
  'Chrome OS': 'linux',
  iOS: 'ios',
};

const DISPLAY_MODES = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'];

const INSTALLED_DESIGN = { ios: 'cupertino', macos: 'cupertino', windows: 'fluent' };

export function detectOS({ ua = '', uaPlatform = '', maxTouchPoints = 0 } = {}) {
  if (uaPlatform && UA_PLATFORM_OS[uaPlatform]) return UA_PLATFORM_OS[uaPlatform];
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Macintosh/.test(ua) && maxTouchPoints > 1) return 'ios';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macos';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/CrOS|Linux/.test(ua)) return 'linux';
  return 'unknown';
}

export function detectBrowser({ ua = '' } = {}) {
  if (/Edg\//.test(ua)) return 'edge';
  if (/Chrome\//.test(ua)) return 'chrome';
  if (/Safari\//.test(ua)) return 'safari';
  if (/Firefox\//.test(ua)) return 'firefox';
  return 'other';
}

export function detectDisplayMode() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'browser';
  return DISPLAY_MODES.find((mode) => window.matchMedia(`(display-mode: ${mode})`).matches) ?? 'browser';
}

export const isInstalled = () =>
  detectDisplayMode() !== 'browser' ||
  (typeof navigator !== 'undefined' && navigator.standalone === true);

export function resolveDesignSystem({ os, installed, override }) {
  if (DESIGN_SYSTEMS.includes(override)) return override;
  if (!installed) return 'web';
  return INSTALLED_DESIGN[os] ?? 'material';
}

export function readOverrideFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search);
  if (!params.has('design')) return undefined;
  const value = params.get('design');
  if (DESIGN_SYSTEMS.includes(value)) return value;
  return value === '' || value === 'auto' ? null : undefined;
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

const OS_TITLES = {
  ios: 'Install on iPhone/iPad',
  macos: 'Install on Mac',
  android: 'Install on Android',
  windows: 'Install on Windows',
  linux: 'Install on Linux',
};

function instructionSteps({ os, browser }) {
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

export const installInstructions = ({ os, browser }) => ({
  title: OS_TITLES[os] ?? 'Install the app',
  steps: instructionSteps({ os, browser }),
});

import { describe, expect, it } from 'vitest';
import {
  DESIGN_OPTIONS,
  DESIGN_SYSTEMS,
  detectBrowser,
  detectOS,
  installInstructions,
  readOverrideFromUrl,
  resolveDesignSystem,
} from '../detect.js';

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  ipadSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  macChrome:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  winEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
  winFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  linuxChrome:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  chromeOS:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
};

describe('detectOS', () => {
  it('maps navigator.userAgentData.platform first', () => {
    expect(detectOS({ uaPlatform: 'Windows', ua: UA.macChrome })).toBe('windows');
    expect(detectOS({ uaPlatform: 'macOS', ua: UA.winEdge })).toBe('macos');
    expect(detectOS({ uaPlatform: 'Android', ua: '' })).toBe('android');
    expect(detectOS({ uaPlatform: 'Linux', ua: '' })).toBe('linux');
    expect(detectOS({ uaPlatform: 'Chrome OS', ua: '' })).toBe('linux');
    expect(detectOS({ uaPlatform: 'iOS', ua: '' })).toBe('ios');
  });

  it('falls back to UA regexes when uaPlatform is empty', () => {
    expect(detectOS({ uaPlatform: '', ua: UA.iphoneSafari, maxTouchPoints: 5 })).toBe('ios');
    expect(detectOS({ ua: UA.macChrome })).toBe('macos');
    expect(detectOS({ ua: UA.winFirefox })).toBe('windows');
    expect(detectOS({ ua: UA.androidChrome })).toBe('android');
    expect(detectOS({ ua: UA.linuxChrome })).toBe('linux');
    expect(detectOS({ ua: UA.chromeOS })).toBe('linux');
  });

  it('distinguishes iPadOS (Macintosh UA + touch) from a real Mac', () => {
    expect(detectOS({ ua: UA.ipadSafari, maxTouchPoints: 5 })).toBe('ios');
    expect(detectOS({ ua: UA.macSafari, maxTouchPoints: 0 })).toBe('macos');
    expect(detectOS({ ua: UA.macSafari, maxTouchPoints: 1 })).toBe('macos');
  });

  it('returns unknown for unrecognised input', () => {
    expect(detectOS({ ua: 'SomethingElse/1.0' })).toBe('unknown');
    expect(detectOS({})).toBe('unknown');
    expect(detectOS()).toBe('unknown');
  });
});

describe('detectBrowser', () => {
  it('orders Edge before Chrome before Safari', () => {
    expect(detectBrowser({ ua: UA.winEdge })).toBe('edge');
    expect(detectBrowser({ ua: UA.macChrome })).toBe('chrome');
    expect(detectBrowser({ ua: UA.androidChrome })).toBe('chrome');
    expect(detectBrowser({ ua: UA.macSafari })).toBe('safari');
    expect(detectBrowser({ ua: UA.iphoneSafari })).toBe('safari');
  });

  it('detects Firefox and falls back to other', () => {
    expect(detectBrowser({ ua: UA.winFirefox })).toBe('firefox');
    expect(detectBrowser({ ua: 'Opera/9.80' })).toBe('other');
    expect(detectBrowser({})).toBe('other');
  });
});

describe('resolveDesignSystem', () => {
  const OS = ['ios', 'macos', 'android', 'windows', 'linux', 'unknown'];

  it('is web in a browser tab on every OS', () => {
    OS.forEach((os) => expect(resolveDesignSystem({ os, installed: false, override: null })).toBe('web'));
  });

  it('maps installed OS to the native kit', () => {
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: null })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'macos', installed: true, override: null })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'android', installed: true, override: null })).toBe('material');
    expect(resolveDesignSystem({ os: 'linux', installed: true, override: null })).toBe('material');
    expect(resolveDesignSystem({ os: 'unknown', installed: true, override: null })).toBe('material');
    expect(resolveDesignSystem({ os: 'windows', installed: true, override: null })).toBe('fluent');
  });

  it('lets a valid override win over detection', () => {
    expect(resolveDesignSystem({ os: 'windows', installed: true, override: 'cupertino' })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'ios', installed: false, override: 'material' })).toBe('material');
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: 'web' })).toBe('web');
  });

  it('ignores invalid overrides', () => {
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: 'bogus' })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: undefined })).toBe('cupertino');
  });
});

describe('readOverrideFromUrl', () => {
  it('returns the design when present', () => {
    expect(readOverrideFromUrl('?design=cupertino')).toBe('cupertino');
    expect(readOverrideFromUrl('?foo=1&design=fluent')).toBe('fluent');
  });

  it('returns null for auto or empty (clears the override)', () => {
    expect(readOverrideFromUrl('?design=auto')).toBeNull();
    expect(readOverrideFromUrl('?design=')).toBeNull();
    expect(readOverrideFromUrl('?design')).toBeNull();
  });

  it('returns undefined when absent or invalid (keep stored override)', () => {
    expect(readOverrideFromUrl('')).toBeUndefined();
    expect(readOverrideFromUrl('?foo=bar')).toBeUndefined();
    expect(readOverrideFromUrl('?design=nope')).toBeUndefined();
  });
});

describe('DESIGN_OPTIONS', () => {
  it('lists auto plus every design system', () => {
    expect(DESIGN_OPTIONS[0]).toEqual({ value: null, label: 'Auto (detect)' });
    expect(DESIGN_OPTIONS.slice(1).map((o) => o.value)).toEqual(DESIGN_SYSTEMS);
    DESIGN_OPTIONS.forEach((o) => expect(typeof o.label).toBe('string'));
  });
});

describe('installInstructions', () => {
  const OS = ['ios', 'macos', 'android', 'windows', 'linux', 'unknown'];
  const BROWSERS = ['safari', 'chrome', 'edge', 'firefox', 'other'];

  it('returns a title and non-empty steps for every os × browser combo', () => {
    OS.forEach((os) =>
      BROWSERS.forEach((browser) => {
        const { title, steps } = installInstructions({ os, browser });
        expect(title.length).toBeGreaterThan(0);
        expect(steps.length).toBeGreaterThan(0);
        steps.forEach((step) => expect(step.length).toBeGreaterThan(0));
      }),
    );
  });

  it('uses the Safari share flow on iOS and asks other browsers to open Safari', () => {
    expect(installInstructions({ os: 'ios', browser: 'safari' })).toEqual({
      title: 'Install on iPhone/iPad',
      steps: ['Tap the Share button', "Choose 'Add to Home Screen'", 'Tap Add'],
    });
    expect(installInstructions({ os: 'ios', browser: 'chrome' }).steps[0]).toBe('Open this page in Safari');
  });

  it('uses Add to Dock on macOS Safari and Chrome steps on macOS Chrome', () => {
    expect(installInstructions({ os: 'macos', browser: 'safari' })).toEqual({
      title: 'Install on Mac',
      steps: ['Open the File menu', "Choose 'Add to Dock…'", 'Click Add'],
    });
    expect(installInstructions({ os: 'macos', browser: 'chrome' }).steps[0]).toMatch(/install icon/);
    expect(installInstructions({ os: 'windows', browser: 'edge' }).steps[0]).toMatch(/app icon/);
  });

  it('handles Android and Firefox variants', () => {
    expect(installInstructions({ os: 'android', browser: 'chrome' }).steps[1]).toMatch(/Install app/);
    expect(installInstructions({ os: 'android', browser: 'firefox' }).steps[0]).toBe('Open the menu (⋮)');
    expect(installInstructions({ os: 'windows', browser: 'firefox' }).steps[0]).toMatch(/Firefox 142\+/);
    expect(installInstructions({ os: 'linux', browser: 'firefox' }).steps[0]).toMatch(/doesn't support/);
    expect(installInstructions({ os: 'unknown', browser: 'other' }).steps[0]).toMatch(/Chrome, Edge or Safari/);
  });
});

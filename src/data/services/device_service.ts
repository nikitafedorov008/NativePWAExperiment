/**
 * data/services/device_service — what device are we on?
 *
 * Pure detection, no state: OS, browser, display mode and whether the app runs
 * installed. UA parsing is only a fallback — `userAgentData.platform` wins
 * where the browser offers it. The design-language decision itself belongs to
 * the repository (it needs the stored override).
 */
export type OS = 'ios' | 'macos' | 'android' | 'windows' | 'linux' | 'unknown';
export type Browser = 'edge' | 'chrome' | 'safari' | 'firefox' | 'other';
export type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'window-controls-overlay' | 'browser';

export interface DeviceInfo {
  os: OS;
  browser: Browser;
  displayMode: DisplayMode;
  installed: boolean;
  isTouch: boolean;
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

export class DeviceService {
  #ua: string;
  #uaPlatform: string;

  constructor(ua: string = globalThis.navigator?.userAgent ?? '', uaPlatform?: string) {
    this.#ua = ua;
    this.#uaPlatform =
      uaPlatform ??
      (globalThis.navigator as Navigator & { userAgentData?: { platform?: string } } | undefined)
        ?.userAgentData?.platform ??
      '';
  }

  get os(): OS {
    const mapped = UA_PLATFORM_OS[this.#uaPlatform];
    if (mapped) return mapped;
    const maxTouchPoints = globalThis.navigator?.maxTouchPoints ?? 0;
    if (/iPhone|iPad|iPod/.test(this.#ua)) return 'ios';
    if (/Macintosh/.test(this.#ua) && maxTouchPoints > 1) return 'ios';
    if (/Macintosh|Mac OS X/.test(this.#ua)) return 'macos';
    if (/Android/.test(this.#ua)) return 'android';
    if (/Windows/.test(this.#ua)) return 'windows';
    if (/CrOS|Linux/.test(this.#ua)) return 'linux';
    return 'unknown';
  }

  get browser(): Browser {
    if (/Edg\//.test(this.#ua)) return 'edge';
    if (/Chrome\//.test(this.#ua)) return 'chrome';
    if (/Safari\//.test(this.#ua)) return 'safari';
    if (/Firefox\//.test(this.#ua)) return 'firefox';
    return 'other';
  }

  get displayMode(): DisplayMode {
    if (typeof globalThis.matchMedia !== 'function') return 'browser';
    return DISPLAY_MODES.find((mode) => globalThis.matchMedia(`(display-mode: ${mode})`).matches) ?? 'browser';
  }

  get installed(): boolean {
    const standalone =
      (globalThis.navigator as (Navigator & { standalone?: boolean }) | undefined)?.standalone === true;
    return this.displayMode !== 'browser' || standalone;
  }

  get isTouch(): boolean {
    const coarse =
      typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(pointer: coarse)').matches;
    return Boolean(coarse) || (globalThis.navigator?.maxTouchPoints ?? 0) > 0;
  }

  get prefersDark(): boolean {
    return (
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  snapshot(): DeviceInfo {
    return {
      os: this.os,
      browser: this.browser,
      displayMode: this.displayMode,
      installed: this.installed,
      isTouch: this.isTouch,
    };
  }

  /** Display-mode and install status change while the app runs. */
  watch(onChange: () => void): () => void {
    if (typeof globalThis.matchMedia !== 'function') return () => {};
    const queries = DISPLAY_MODES.map((mode) => globalThis.matchMedia(`(display-mode: ${mode})`));
    queries.forEach((mql) => mql.addEventListener('change', onChange));
    globalThis.addEventListener?.('appinstalled', onChange);
    return () => {
      queries.forEach((mql) => mql.removeEventListener('change', onChange));
      globalThis.removeEventListener?.('appinstalled', onChange);
    };
  }
}

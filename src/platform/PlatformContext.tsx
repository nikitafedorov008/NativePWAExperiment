/**
 * Platform layer: detects the environment once at boot (OS, browser, display
 * mode, install status) and resolves which design language to render — an
 * explicit override from ?design=… / localStorage wins, otherwise installed
 * PWAs get their OS-native language (Cupertino on iOS/macOS, Material on
 * Android, Fluent on Windows, Yaru on Linux) and browser tabs get the app's
 * custom one. The language registry itself lives in the ui-kit package; this
 * layer only feeds it what it detected. Live media queries keep display mode
 * and color scheme up to date while running.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isDesignSystem, resolveDesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import type { DesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import { detectBrowser, detectDisplayMode, detectOS, isInstalled, readOverrideFromUrl } from './detect.ts';
import type { Browser, DisplayMode, OS } from './detect.ts';

export interface PlatformInfo {
  os: OS;
  browser: Browser;
  displayMode: DisplayMode;
  installed: boolean;
  designSystem: DesignSystem;
  override: DesignSystem | null;
  setOverride(value: DesignSystem | null): void;
  isTouch: boolean;
  prefersDark: boolean;
}

interface BootState {
  os: OS;
  browser: Browser;
  override: DesignSystem | null;
  installed: boolean;
  displayMode: DisplayMode;
  designSystem: DesignSystem;
}

const PlatformContext = createContext<PlatformInfo | null>(null);
const OVERRIDE_KEY = 'streaks.designOverride';
const LIVE_QUERIES = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'].map(
  (mode) => `(display-mode: ${mode})`,
);

// `<T,>` — the comma stops TSX from parsing the generic as a JSX element.
const safely = <T,>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

const readStoredOverride = (): DesignSystem | null => {
  const value = safely(() => localStorage.getItem(OVERRIDE_KEY));
  return isDesignSystem(value) ? value : null;
};

const writeStoredOverride = (value: DesignSystem | null): void => {
  safely(() => (value ? localStorage.setItem(OVERRIDE_KEY, value) : localStorage.removeItem(OVERRIDE_KEY)));
};

function bootOverride(): DesignSystem | null {
  const fromUrl = readOverrideFromUrl();
  if (fromUrl === undefined) return readStoredOverride();
  writeStoredOverride(fromUrl);
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  return fromUrl;
}

const mediaMatches = (query: string): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

const detectTouch = (): boolean => mediaMatches('(pointer: coarse)') || navigator.maxTouchPoints > 0;

function boot(): BootState {
  const override = bootOverride();
  const ua = navigator.userAgent;
  // userAgentData is Chromium-only and not in lib.dom yet.
  const uaPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? '';
  const os = detectOS({
    ua,
    uaPlatform,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
  });
  const installed = isInstalled();
  return {
    os,
    browser: detectBrowser({ ua }),
    override,
    installed,
    displayMode: detectDisplayMode(),
    designSystem: resolveDesignSystem({ os, installed, override }),
  };
}

const reloadIfDesignChanges = (current: DesignSystem, next: DesignSystem): void => {
  if (current !== next) window.location.replace(window.location.pathname);
};

function useLiveQuery<T>(query: string, read: () => T): T {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mql = window.matchMedia(query);
    const update = () => setValue(read());
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query, read]);
  return value;
}

const prefersDarkNow = (): boolean => mediaMatches('(prefers-color-scheme: dark)');

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(boot);
  const [override, setOverrideState] = useState<DesignSystem | null>(initial.override);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(initial.displayMode);
  const [installed, setInstalled] = useState(initial.installed);
  const prefersDark = useLiveQuery('(prefers-color-scheme: dark)', prefersDarkNow);
  const isTouch = useLiveQuery('(pointer: coarse)', detectTouch);
  const { os, browser, designSystem } = initial;

  useEffect(() => {
    const sync = () => {
      const nextInstalled = isInstalled();
      setDisplayMode(detectDisplayMode());
      setInstalled(nextInstalled);
      reloadIfDesignChanges(designSystem, resolveDesignSystem({ os, installed: nextInstalled, override }));
    };
    const queries =
      typeof window.matchMedia === 'function' ? LIVE_QUERIES.map((q) => window.matchMedia(q)) : [];
    queries.forEach((mql) => mql.addEventListener('change', sync));
    window.addEventListener('appinstalled', sync);
    return () => {
      queries.forEach((mql) => mql.removeEventListener('change', sync));
      window.removeEventListener('appinstalled', sync);
    };
  }, [os, designSystem, override]);

  const setOverride = useCallback(
    (value: DesignSystem | null): void => {
      const next = isDesignSystem(value) ? value : null;
      writeStoredOverride(next);
      setOverrideState(next);
      reloadIfDesignChanges(designSystem, resolveDesignSystem({ os, installed, override: next }));
    },
    [os, installed, designSystem],
  );

  const value = useMemo<PlatformInfo>(
    () => ({ os, browser, displayMode, installed, designSystem, override, setOverride, isTouch, prefersDark }),
    [os, browser, displayMode, installed, designSystem, override, setOverride, isTouch, prefersDark],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformInfo {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within <PlatformProvider>');
  return ctx;
}

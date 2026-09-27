import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DESIGN_SYSTEMS,
  detectBrowser,
  detectDisplayMode,
  detectOS,
  isInstalled,
  readOverrideFromUrl,
  resolveDesignSystem,
} from './detect.js';

const PlatformContext = createContext(null);
const OVERRIDE_KEY = 'streaks.designOverride';
const LIVE_QUERIES = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'].map(
  (mode) => `(display-mode: ${mode})`,
);

const safely = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

const readStoredOverride = () => {
  const value = safely(() => localStorage.getItem(OVERRIDE_KEY));
  return DESIGN_SYSTEMS.includes(value) ? value : null;
};

const writeStoredOverride = (value) =>
  safely(() => (value ? localStorage.setItem(OVERRIDE_KEY, value) : localStorage.removeItem(OVERRIDE_KEY)));

function bootOverride() {
  const fromUrl = readOverrideFromUrl();
  if (fromUrl === undefined) return readStoredOverride();
  writeStoredOverride(fromUrl);
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  return fromUrl;
}

const mediaMatches = (query) =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

const detectTouch = () => mediaMatches('(pointer: coarse)') || navigator.maxTouchPoints > 0;

function boot() {
  const override = bootOverride();
  const ua = navigator.userAgent;
  const os = detectOS({
    ua,
    uaPlatform: navigator.userAgentData?.platform ?? '',
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

const reloadIfDesignChanges = (current, next) => {
  if (current !== next) window.location.replace(window.location.pathname);
};

function useLiveQuery(query, read) {
  const [value, setValue] = useState(read);
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

const prefersDarkNow = () => mediaMatches('(prefers-color-scheme: dark)');

export function PlatformProvider({ children }) {
  const [initial] = useState(boot);
  const [override, setOverrideState] = useState(initial.override);
  const [displayMode, setDisplayMode] = useState(initial.displayMode);
  const [installed, setInstalled] = useState(initial.installed);
  const prefersDark = useLiveQuery('(prefers-color-scheme: dark)', prefersDarkNow);
  const isTouch = useLiveQuery('(pointer: coarse)', detectTouch);
  const { os, browser, designSystem } = initial;

  useEffect(() => {
    const sync = () => {
      const nextInstalled = isInstalled();
      setDisplayMode(detectDisplayMode());
      setInstalled(nextInstalled);
      reloadIfDesignChanges(
        designSystem,
        resolveDesignSystem({ os, installed: nextInstalled, override }),
      );
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
    (value) => {
      const next = DESIGN_SYSTEMS.includes(value) ? value : null;
      writeStoredOverride(next);
      setOverrideState(next);
      reloadIfDesignChanges(designSystem, resolveDesignSystem({ os, installed, override: next }));
    },
    [os, installed, designSystem],
  );

  const value = useMemo(
    () => ({ os, browser, displayMode, installed, designSystem, override, setOverride, isTouch, prefersDark }),
    [os, browser, displayMode, installed, designSystem, override, setOverride, isTouch, prefersDark],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within <PlatformProvider>');
  return ctx;
}

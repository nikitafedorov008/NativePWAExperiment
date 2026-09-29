/**
 * data/repositories/design_language_repository — which design language is on.
 *
 * The decision belongs here (not in a view): it reads the `?design=` override,
 * persists the user's choice, and combines it with what the device service
 * reports. The registry itself lives in the ui-kit package, so this repository
 * is the only place that knows both "what the device is" and "what the user
 * asked for".
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';
import { isDesignSystem, resolveDesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import type { DesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import type { Browser, DeviceInfo, DeviceService, DisplayMode, OS } from '../services/device_service.ts';
import type { LocalStorageService } from '../services/local_storage_service.ts';

const OVERRIDE_KEY = 'designOverride';

export interface AppearanceState {
  os: OS;
  browser: Browser;
  displayMode: DisplayMode;
  installed: boolean;
  isTouch: boolean;
  prefersDark: boolean;
  designSystem: DesignSystem;
  override: DesignSystem | null;
}

export type AppearanceStore = StoreApi<AppearanceState>;

export interface DesignLanguageRepository {
  readonly store: AppearanceStore;
  /**
   * Resolves the override at boot: a valid `?design=` wins and is stored,
   * `auto`/empty clears it, anything else keeps the stored value. The query
   * string is then cleaned so a reload does not re-apply it.
   */
  load(search?: string): void;
  setOverride(value: DesignSystem | null): void;
  watch(): void;
}

const compose = (
  device: DeviceInfo,
  prefersDark: boolean,
  override: DesignSystem | null,
): AppearanceState => ({
  ...device,
  prefersDark,
  override,
  designSystem: resolveDesignSystem({ os: device.os, installed: device.installed, override }),
});

export function createDesignLanguageRepository(
  storage: LocalStorageService,
  device: DeviceService,
): DesignLanguageRepository {
  const store = createStore<AppearanceState>(() =>
    compose(device.snapshot(), device.prefersDark, null),
  );
  let unwatch: (() => void) | null = null;

  const apply = (override: DesignSystem | null): void => {
    store.setState(compose(device.snapshot(), device.prefersDark, override));
  };

  return {
    store,
    load(search: string = globalThis.location?.search ?? ''): void {
      const params = new URLSearchParams(search);
      const stored = storage.readString(OVERRIDE_KEY);
      let override: DesignSystem | null = isDesignSystem(stored) ? stored : null;

      if (params.has('design')) {
        const value = params.get('design');
        if (isDesignSystem(value)) {
          override = value;
          storage.writeString(OVERRIDE_KEY, value);
        } else if (value === '' || value === 'auto') {
          override = null;
          storage.remove(OVERRIDE_KEY);
        }
        globalThis.history?.replaceState(
          null,
          '',
          globalThis.location.pathname + globalThis.location.hash,
        );
      }
      apply(override);
    },
    /**
     * Switching the language rebuilds the whole theme; Framework7 fixes its
     * theme at boot, so the app reloads rather than re-rendering in place.
     */
    setOverride(value: DesignSystem | null): void {
      const next = isDesignSystem(value) ? value : null;
      if (next === store.getState().override) return;
      if (next) storage.writeString(OVERRIDE_KEY, next);
      else storage.remove(OVERRIDE_KEY);
      apply(next);
      globalThis.location?.replace(globalThis.location.pathname);
    },
    /** Keeps display mode / install status / colour scheme live. */
    watch(): void {
      if (unwatch) return;
      const onChange = (): void => apply(store.getState().override);
      const unwatchDevice = device.watch(onChange);
      const media =
        typeof globalThis.matchMedia === 'function'
          ? globalThis.matchMedia('(prefers-color-scheme: dark)')
          : null;
      media?.addEventListener('change', onChange);
      unwatch = () => {
        unwatchDevice();
        media?.removeEventListener('change', onChange);
      };
    },
  };
}

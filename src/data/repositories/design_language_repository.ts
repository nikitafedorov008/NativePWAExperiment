/**
 * data/repositories/design_language_repository — which design language is on.
 *
 * The decision belongs here (not in a view): it reads the `?design=` override,
 * persists the user's choice, and combines it with what the device service
 * reports. The registry itself lives in the ui-kit package, so this repository
 * is the only place that knows both "what the device is" and "what the user
 * asked for".
 */
import { ChangeNotifier } from '../../core/change_notifier.ts';
import { DESIGN_SYSTEMS, isDesignSystem, resolveDesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import type { DesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import type { DeviceInfo, DeviceService, Browser, DisplayMode, OS } from '../services/device_service.ts';
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

export class DesignLanguageRepository extends ChangeNotifier {
  #override: DesignSystem | null = null;
  #device: DeviceInfo;
  #prefersDark: boolean;
  #state: AppearanceState;
  #unwatch: (() => void) | null = null;

  constructor(
    private readonly storage: LocalStorageService,
    private readonly device: DeviceService,
  ) {
    super();
    this.#device = device.snapshot();
    this.#prefersDark = device.prefersDark;
    this.#state = this.#compose();
  }

  get state(): AppearanceState {
    return this.#state;
  }

  /**
   * Resolves the override once at boot: a valid `?design=` wins and is stored,
   * `auto`/empty clears it, anything else keeps the stored value. The query
   * string is then cleaned so a reload does not re-apply it.
   */
  load(search: string = globalThis.location?.search ?? ''): void {
    const params = new URLSearchParams(search);
    if (params.has('design')) {
      const value = params.get('design');
      if (isDesignSystem(value)) {
        this.#override = value;
        this.storage.writeString(OVERRIDE_KEY, value);
      } else if (value === '' || value === 'auto') {
        this.#override = null;
        this.storage.remove(OVERRIDE_KEY);
      }
      globalThis.history?.replaceState(null, '', globalThis.location.pathname + globalThis.location.hash);
    } else {
      const stored = this.storage.readString(OVERRIDE_KEY);
      this.#override = isDesignSystem(stored) ? stored : null;
    }
    this.#publish();
  }

  /**
   * Switching the language rebuilds the whole theme; Framework7 fixes its theme
   * at boot, so the app reloads rather than re-rendering in place.
   */
  setOverride(value: DesignSystem | null): void {
    const next = isDesignSystem(value) ? value : null;
    if (next === this.#override) return;
    if (next) this.storage.writeString(OVERRIDE_KEY, next);
    else this.storage.remove(OVERRIDE_KEY);
    this.#override = next;
    this.#publish();
    globalThis.location?.replace(globalThis.location.pathname);
  }

  /** Keeps display mode / install status / colour scheme live. */
  watch(): void {
    if (this.#unwatch) return;
    const onChange = (): void => {
      this.#device = this.device.snapshot();
      this.#prefersDark = this.device.prefersDark;
      this.#publish();
    };
    const unwatchDevice = this.device.watch(onChange);
    const media =
      typeof window?.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    media?.addEventListener('change', onChange);
    this.#unwatch = () => {
      unwatchDevice();
      media?.removeEventListener('change', onChange);
    };
  }

  static get options(): readonly { value: DesignSystem | null; label: string }[] {
    return DESIGN_SYSTEMS.map((id) => ({ value: id, label: id }));
  }

  reset(): void {
    this.storage.remove(OVERRIDE_KEY);
    this.#override = null;
    this.#publish();
  }

  dispose(): void {
    this.#unwatch?.();
    this.#unwatch = null;
    super.dispose();
  }

  #compose(): AppearanceState {
    return {
      ...this.#device,
      prefersDark: this.#prefersDark,
      override: this.#override,
      designSystem: resolveDesignSystem({
        os: this.#device.os,
        installed: this.#device.installed,
        override: this.#override,
      }),
    };
  }

  #publish(): void {
    this.#state = this.#compose();
    this.notifyListeners();
  }
}

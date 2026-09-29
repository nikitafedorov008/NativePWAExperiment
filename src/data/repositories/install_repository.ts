/**
 * data/repositories/install_repository — the install flow as a store.
 *
 * Combines three sources into one answer for the UI: whether the browser
 * offered a prompt (install service), whether the user hid the banner
 * (persisted), and which per-browser instructions to show when no prompt
 * exists (derived from what the device service reports).
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';
import { installInstructions } from '../services/install_service.ts';
import type { InstallInstructions, InstallOutcome, InstallService } from '../services/install_service.ts';
import type { DeviceService } from '../services/device_service.ts';
import type { LocalStorageService } from '../services/local_storage_service.ts';

const DISMISS_KEY = 'installBannerDismissed';

export interface InstallState {
  canPrompt: boolean;
  installed: boolean;
  outcome: InstallOutcome | null;
  dismissed: boolean;
  /** True when the banner should be shown on Today. */
  visible: boolean;
  instructions: InstallInstructions;
}

export type InstallStore = StoreApi<InstallState>;

export interface InstallRepository {
  readonly store: InstallStore;
  start(): void;
  prompt(): Promise<InstallOutcome | 'unavailable'>;
  dismiss(): void;
  undismiss(): void;
}

export function createInstallRepository(
  service: InstallService,
  storage: LocalStorageService,
  device: DeviceService,
): InstallRepository {
  let dismissed = storage.readString(DISMISS_KEY) === '1';

  const compose = (): InstallState => {
    const event = service.getState();
    const installed = device.installed || event.installed;
    return {
      canPrompt: event.canPrompt,
      installed,
      outcome: event.outcome,
      dismissed,
      visible: !installed && !dismissed,
      instructions: installInstructions({ os: device.os, browser: device.browser }),
    };
  };

  const store = createStore<InstallState>(compose);
  service.subscribe(() => store.setState(compose()));

  return {
    store,
    start(): void {
      service.start();
      store.setState(compose());
    },
    async prompt(): Promise<InstallOutcome | 'unavailable'> {
      const outcome = await service.prompt();
      dismissed = false;
      store.setState(compose());
      return outcome;
    },
    dismiss(): void {
      dismissed = true;
      storage.writeString(DISMISS_KEY, '1');
      store.setState(compose());
    },
    undismiss(): void {
      dismissed = false;
      storage.remove(DISMISS_KEY);
      store.setState(compose());
    },
  };
}

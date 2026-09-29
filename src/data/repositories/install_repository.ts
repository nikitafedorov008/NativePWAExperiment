/**
 * data/repositories/install_repository — the install flow as observable state.
 *
 * Combines three sources into one answer for the UI: whether the browser
 * offered a prompt (install service), whether the user hid the banner
 * (persisted), and which per-browser instructions to show when no prompt
 * exists (derived from what the device service reports).
 */
import { ChangeNotifier } from '../../core/change_notifier.ts';
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

export class InstallRepository extends ChangeNotifier {
  #dismissed = false;
  #state: InstallState;

  constructor(
    private readonly service: InstallService,
    private readonly storage: LocalStorageService,
    private readonly device: DeviceService,
  ) {
    super();
    this.#dismissed = this.storage.readString(DISMISS_KEY) === '1';
    this.#state = this.#compose();
    this.service.addListener(() => this.#publish());
  }

  get state(): InstallState {
    return this.#state;
  }

  start(): void {
    this.service.start();
    this.#publish();
  }

  async prompt(): Promise<InstallOutcome | 'unavailable'> {
    const outcome = await this.service.prompt();
    this.#dismissed = false;
    this.#publish();
    return outcome;
  }

  dismiss(): void {
    this.#dismissed = true;
    this.storage.writeString(DISMISS_KEY, '1');
    this.#publish();
  }

  undismiss(): void {
    this.#dismissed = false;
    this.storage.remove(DISMISS_KEY);
    this.#publish();
  }

  #compose(): InstallState {
    const event = this.service.state;
    const installed = this.device.installed || event.installed;
    return {
      canPrompt: event.canPrompt,
      installed,
      outcome: event.outcome,
      dismissed: this.#dismissed,
      visible: !installed && !this.#dismissed,
      instructions: installInstructions({ os: this.device.os, browser: this.device.browser }),
    };
  }

  #publish(): void {
    this.#state = this.#compose();
    this.notifyListeners();
  }
}

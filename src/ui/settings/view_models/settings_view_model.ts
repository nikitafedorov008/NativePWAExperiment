/**
 * ui/settings/view_models — the Settings view model. It combines what the
 * device reports (design repository) with the install repository, and formats
 * the platform rows the views render.
 */
import { ChangeNotifier } from '../../../core/change_notifier.ts';
import { DESIGN_OPTIONS } from '@native-pwa-experiment/ui-kit/design-systems';
import type { DesignSystem } from '@native-pwa-experiment/ui-kit/design-systems';
import type { DesignLanguageRepository } from '../../../data/repositories/design_language_repository.ts';
import type { InstallRepository, InstallState } from '../../../data/repositories/install_repository.ts';
import type { HabitsRepository } from '../../../data/repositories/habits_repository.ts';

export interface SettingsState {
  rows: { label: string; value: string }[];
  design: {
    current: DesignSystem;
    override: DesignSystem | null;
    options: { value: DesignSystem | null; label: string }[];
  };
  install: InstallState;
  resetOpen: boolean;
}

export class SettingsViewModel extends ChangeNotifier {
  #resetOpen = false;
  #state: SettingsState;

  constructor(
    private readonly design: DesignLanguageRepository,
    private readonly install: InstallRepository,
    private readonly habits: HabitsRepository,
  ) {
    super();
    this.#state = this.#compose();
    this.design.addListener(() => this.#publish());
    this.install.addListener(() => this.#publish());
  }

  get state(): SettingsState {
    return this.#state;
  }

  setDesign(value: DesignSystem | null): void {
    this.design.setOverride(value);
  }

  requestReset(): void {
    this.#resetOpen = true;
    this.#publish();
  }

  cancelReset(): void {
    this.#resetOpen = false;
    this.#publish();
  }

  confirmReset(): void {
    this.habits.reset();
    this.#resetOpen = false;
    this.#publish();
  }

  dismissInstall(): void {
    this.install.dismiss();
  }

  promptInstall(): void {
    void this.install.prompt();
  }

  #compose(): SettingsState {
    const appearance = this.design.state;
    return {
      rows: [
        { label: 'Platform', value: appearance.os },
        { label: 'Browser', value: appearance.browser },
        { label: 'Display mode', value: appearance.displayMode },
        { label: 'Design system', value: appearance.designSystem },
        { label: 'Install status', value: appearance.installed ? 'Installed' : 'Browser tab' },
      ],
      design: {
        current: appearance.designSystem,
        override: appearance.override,
        options: [...DESIGN_OPTIONS],
      },
      install: this.install.state,
      resetOpen: this.#resetOpen,
    };
  }

  #publish(): void {
    this.#state = this.#compose();
    this.notifyListeners();
  }
}

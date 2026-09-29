/**
 * ui/settings/view_models — the Settings view model. It combines what the
 * device reports (design repository) with the install repository, formats the
 * platform rows the views render, and owns the reset-confirmation flag.
 */
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand';
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

export interface SettingsActions {
  setDesign(value: DesignSystem | null): void;
  requestReset(): void;
  cancelReset(): void;
  confirmReset(): void;
  dismissInstall(): void;
  promptInstall(): void;
}

export type SettingsViewModel = StoreApi<SettingsState & SettingsActions>;

export interface SettingsDeps {
  design: DesignLanguageRepository;
  install: InstallRepository;
  habits: HabitsRepository;
}

export function createSettingsViewModel({ design, install, habits }: SettingsDeps): SettingsViewModel {
  const compose = (resetOpen: boolean): SettingsState => {
    const appearance = design.store.getState();
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
      install: install.store.getState(),
      resetOpen,
    };
  };

  const store = createStore<SettingsState & SettingsActions>((set) => ({
    ...compose(false),

    setDesign: (value) => design.setOverride(value),
    requestReset: () => set({ resetOpen: true }),
    cancelReset: () => set({ resetOpen: false }),
    confirmReset: () => {
      habits.reset();
      set({ resetOpen: false });
    },
    dismissInstall: () => install.dismiss(),
    promptInstall: () => void install.prompt(),
  }));

  design.store.subscribe(() => store.setState(compose(store.getState().resetOpen)));
  install.store.subscribe(() => store.setState(compose(store.getState().resetOpen)));
  return store;
}

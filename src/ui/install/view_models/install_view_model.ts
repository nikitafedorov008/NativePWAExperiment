/**
 * ui/install/view_models — the install banner's view model: it mirrors the
 * install repository's state and adds the two commands the banner and the
 * settings screen share.
 */
import { createStore } from 'zustand/vanilla';
import type { InstallRepository, InstallState } from '../../../data/repositories/install_repository.ts';

export interface InstallActions {
  dismiss(): void;
  prompt(): void;
}

export type InstallViewModel = ReturnType<typeof createInstallViewModel>;

export function createInstallViewModel(install: InstallRepository) {
  const store = createStore<InstallState & InstallActions>(() => ({
    ...install.store.getState(),
    dismiss: () => install.dismiss(),
    prompt: () => void install.prompt(),
  }));

  install.store.subscribe((state) => store.setState(state));
  return store;
}

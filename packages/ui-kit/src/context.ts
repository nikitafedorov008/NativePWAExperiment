/**
 * The kit never imports the app: the app injects the view models, the resolved
 * appearance and the domain constants through this context. Views read state
 * and call commands — nothing else.
 *
 * The matching provider component lives in KitApiProvider.tsx (this module is
 * plain TS so the hooks can be imported from anywhere).
 */
import { createContext, useContext } from 'react';
import type {
  Appearance,
  DomainConstants,
  InstallViewModelApi,
  KitApi,
  SettingsViewModelApi,
  StatsViewModelApi,
  TodayViewModelApi,
} from './types.ts';

export const KitApiContext = createContext<KitApi | null>(null);

export function useKitApi(): KitApi {
  const api = useContext(KitApiContext);
  if (!api) throw new Error('The UI kit must be rendered inside <KitApiProvider>.');
  return api;
}

export const useTodayViewModel = (): TodayViewModelApi => useKitApi().today;
export const useStatsViewModel = (): StatsViewModelApi => useKitApi().stats;
export const useSettingsViewModel = (): SettingsViewModelApi => useKitApi().settings;
export const useInstallViewModel = (): InstallViewModelApi => useKitApi().install;
/** Design language + colour scheme the theme provider asks for. */
export const useAppearance = (): Appearance => useKitApi().appearance;
/** Domain constants the forms need: EMOJI_PRESETS, DEFAULT_EMOJI, NAME_MAX_LENGTH. */
export const useDomainConstants = (): DomainConstants => useKitApi().constants;

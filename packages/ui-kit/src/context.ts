/**
 * The kit never imports the app: the app injects everything the screens need
 * (domain state, install flow, platform info, domain constants) through this
 * single context. That keeps the package free of app dependencies, so it can
 * be lifted into another project as-is.
 *
 * The matching provider component lives in KitApiProvider.tsx (this module is
 * plain TS so the hooks can be imported from anywhere).
 */
import { createContext, useContext } from 'react';
import type {
  DomainConstants,
  HabitsApi,
  InstallApi,
  KitApi,
  PlatformApi,
} from './types.ts';

export const KitApiContext = createContext<KitApi | null>(null);

export function useKitApi(): KitApi {
  const api = useContext(KitApiContext);
  if (!api) throw new Error('The UI kit must be rendered inside <KitApiProvider>.');
  return api;
}

/** Habit domain state: habits, progress, addHabit/renameHabit/removeHabit, toggle… */
export const useHabits = (): HabitsApi => useKitApi().habits;
/** Install flow: canPrompt, promptInstall, outcome, instructions, dismissed… */
export const useInstall = (): InstallApi => useKitApi().install;
/** Platform info: os, browser, displayMode, designSystem, installed, override… */
export const usePlatform = (): PlatformApi => useKitApi().platform;
/** Domain constants the forms need: EMOJI_PRESETS, DEFAULT_EMOJI, NAME_MAX_LENGTH. */
export const useDomainConstants = (): DomainConstants => useKitApi().constants;

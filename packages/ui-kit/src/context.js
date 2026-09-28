/**
 * The kit never imports the app: the app injects everything the screens need
 * (domain state, install flow, platform info, domain constants) through this
 * single context. That keeps the package free of app dependencies, so it can
 * be lifted into another project as-is.
 *
 * The matching provider component lives in KitApiProvider.jsx (this module is
 * plain JS so the hooks can be imported from anywhere).
 */
import { createContext, useContext } from 'react';

export const KitApiContext = createContext(null);

export function useKitApi() {
  const api = useContext(KitApiContext);
  if (!api) throw new Error('The UI kit must be rendered inside <KitApiProvider>.');
  return api;
}

/** Habit domain state: habits, progress, addHabit/renameHabit/removeHabit, toggle… */
export const useHabits = () => useKitApi().habits;
/** Install flow: canPrompt, promptInstall, outcome, instructions, dismissed… */
export const useInstall = () => useKitApi().install;
/** Platform info: os, browser, displayMode, designSystem, installed, override… */
export const usePlatform = () => useKitApi().platform;
/** Domain constants the forms need: EMOJI_PRESETS, DEFAULT_EMOJI, NAME_MAX_LENGTH. */
export const useDomainConstants = () => useKitApi().constants;

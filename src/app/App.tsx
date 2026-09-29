/**
 * App composition root for the UI.
 *
 * The ui-kit package knows nothing about this app: everything its screens need
 * is injected here — the habit domain state, the install flow, platform info
 * and the domain constants the forms use. The `KitApi` type is the contract;
 * TypeScript checks that this object satisfies it. Swap the kit for another
 * one and only this file changes.
 */
import { KitApiProvider, Root } from '@native-pwa-experiment/ui-kit';
import type { KitApi } from '@native-pwa-experiment/ui-kit';
import { useHabits } from '../domain/habits/HabitsContext.tsx';
import { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } from '../domain/habits/model.ts';
import { usePlatform } from '../platform/PlatformContext.tsx';
import { useInstallPrompt } from '../platform/useInstallPrompt.ts';

export default function App() {
  const habits = useHabits();
  const install = useInstallPrompt();
  const platform = usePlatform();

  const api: KitApi = {
    habits,
    install,
    platform,
    constants: { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH },
  };

  return (
    <KitApiProvider api={api}>
      <Root />
    </KitApiProvider>
  );
}

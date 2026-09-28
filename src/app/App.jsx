/**
 * App composition root for the UI.
 *
 * The ui-kit package knows nothing about this app: everything its screens need
 * is injected here — the habit domain state, the install flow, platform info
 * and the domain constants the forms use. Swap the kit for another one and
 * only this file changes.
 */
import { KitApiProvider, Root } from '@native-pwa-experiment/ui-kit';
import { useHabits } from '../domain/habits/HabitsContext.jsx';
import { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } from '../domain/habits/model.js';
import { usePlatform } from '../platform/PlatformContext.jsx';
import { useInstallPrompt } from '../platform/useInstallPrompt.js';

export default function App() {
  const habits = useHabits();
  const install = useInstallPrompt();
  const platform = usePlatform();
  const constants = { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH };

  return (
    <KitApiProvider api={{ habits, install, platform, constants }}>
      <Root />
    </KitApiProvider>
  );
}

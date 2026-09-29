/**
 * app/App — the UI composition root.
 *
 * The ui-kit package knows nothing about this app: the view models built in
 * app/services.tsx (plus the appearance store and the domain constants the
 * forms need) are injected here, and TypeScript checks the object against the
 * kit's `KitApi` contract. Swapping the kit — or reusing it in another
 * project — only touches this file.
 */
import { useStore } from 'zustand';
import { KitApiProvider, Root } from '@native-pwa-experiment/ui-kit';
import type { KitApi } from '@native-pwa-experiment/ui-kit';
import { useServices } from './services.tsx';

export default function App() {
  const { today, stats, settings, install, appearance: appearanceStore, constants } = useServices();
  // Subscribed, not snapshotted: the design language can change at boot (URL
  // override), when the app is installed, or when the OS scheme flips.
  const appearance = useStore(appearanceStore);

  const api: KitApi = {
    today,
    stats,
    settings,
    install,
    appearance,
    constants,
  };

  return (
    <KitApiProvider api={api}>
      <Root />
    </KitApiProvider>
  );
}

/**
 * Entry point. Composition root of the app:
 *
 *   PlatformProvider  detects OS / browser / installed mode and resolves the
 *                     design language (cupertino · material · fluent · yaru ·
 *                     custom · shadcn).
 *   CelebrationProvider owns the confetti canvas shared by every UI kit.
 *   HabitsProvider    owns the domain state (persisted to localStorage).
 *   App               hands the domain to the ui-kit, which renders the
 *                     matching design language.
 *
 * registerSW() installs the vite-plugin-pwa service worker (autoUpdate), which
 * precaches the build so the app works offline and installs cleanly.
 */
import './platform/installPromptStore.ts';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { PlatformProvider } from './platform/PlatformContext.tsx';
import { CelebrationProvider, ConfettiCanvas } from './domain/celebration/CelebrationContext.tsx';
import { HabitsProvider } from './domain/habits/HabitsContext.tsx';
import App from './app/App.tsx';

registerSW({ immediate: true });

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root is missing from index.html');

createRoot(container).render(
  <PlatformProvider>
    <CelebrationProvider>
      <HabitsProvider>
        <App />
      </HabitsProvider>
      <ConfettiCanvas />
    </CelebrationProvider>
  </PlatformProvider>,
);

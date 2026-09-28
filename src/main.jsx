/**
 * Entry point. Composition root of the app:
 *
 *   PlatformProvider  detects OS / browser / installed mode and resolves the
 *                     design system (web · cupertino · material · fluent).
 *   CelebrationProvider owns the confetti canvas shared by every UI kit.
 *   HabitsProvider    owns the domain state (persisted to localStorage).
 *   App               switches to the matching UI implementation.
 *
 * registerSW() installs the vite-plugin-pwa service worker (autoUpdate), which
 * precaches the build so the app works offline and installs cleanly.
 */
import './platform/installPromptStore.js';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { PlatformProvider } from './platform/PlatformContext.jsx';
import { CelebrationProvider, ConfettiCanvas } from './domain/celebration/CelebrationContext.jsx';
import { HabitsProvider } from './domain/habits/HabitsContext.jsx';
import App from './app/App.jsx';

registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <PlatformProvider>
    <CelebrationProvider>
      <HabitsProvider>
        <App />
      </HabitsProvider>
      <ConfettiCanvas />
    </CelebrationProvider>
  </PlatformProvider>,
);

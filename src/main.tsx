/**
 * Entry point (Flutter's `main.dart`): wire the object graph once, mount the
 * app, and register the service worker.
 *
 *   ServicesProvider  builds services → repositories → view models
 *   App               injects those view models into the ui-kit
 *   ConfettiCanvas    the one DOM surface a service needs
 */
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { ServicesProvider } from './app/services.tsx';
import ConfettiCanvas from './ui/core/widgets/confetti_canvas.tsx';
import App from './app/App.tsx';

registerSW({ immediate: true });

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root is missing from index.html');

createRoot(container).render(
  <ServicesProvider>
    <App />
    <ConfettiCanvas />
  </ServicesProvider>,
);

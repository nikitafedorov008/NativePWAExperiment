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

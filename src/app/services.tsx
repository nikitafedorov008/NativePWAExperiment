/**
 * app/services — the composition root (Flutter's `di.dart` / Provider wiring).
 *
 * Everything is constructed once, here, and handed down: services (storage,
 * clock, device, install, celebration) → repositories → view models. No module
 * reaches for a global; the wiring is visible in one place, which is what makes
 * the layers swappable and testable. Repositories and view models are zustand
 * stores, so React subscribes with `useStore(store)`.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LocalStorageService } from '../data/services/local_storage_service.ts';
import { createClockService } from '../data/services/clock_service.ts';
import { DeviceService } from '../data/services/device_service.ts';
import { createInstallService } from '../data/services/install_service.ts';
import { CelebrationService } from '../data/services/celebration_service.ts';
import { createHabitsRepository } from '../data/repositories/habits_repository.ts';
import { createDesignLanguageRepository } from '../data/repositories/design_language_repository.ts';
import { createInstallRepository } from '../data/repositories/install_repository.ts';
import { createTodayViewModel } from '../ui/today/view_models/today_view_model.ts';
import { createStatsViewModel } from '../ui/stats/view_models/stats_view_model.ts';
import { createSettingsViewModel } from '../ui/settings/view_models/settings_view_model.ts';
import { createInstallViewModel } from '../ui/install/view_models/install_view_model.ts';
import { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } from '../domain/models/habit.ts';

export interface DomainConstants {
  DEFAULT_EMOJI: string;
  EMOJI_PRESETS: readonly string[];
  NAME_MAX_LENGTH: number;
}

const APP_PREFIX = 'streaks';

export function createServices() {
  const storage = new LocalStorageService(APP_PREFIX);
  const clock = createClockService();
  const device = new DeviceService();
  const installService = createInstallService();
  const celebration = new CelebrationService();

  const habits = createHabitsRepository(storage, clock);
  const design = createDesignLanguageRepository(storage, device);
  const installRepository = createInstallRepository(installService, storage, device);

  const constants: DomainConstants = { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH };

  return {
    storage,
    clock,
    device,
    installService,
    celebration,
    habits,
    design,
    installRepository,
    today: createTodayViewModel({ habits, celebration }),
    stats: createStatsViewModel(habits),
    settings: createSettingsViewModel({ design, install: installRepository, habits }),
    install: createInstallViewModel(installRepository),
    /** Appearance is plain data: the kit only reads it to pick a theme. */
    appearance: design.store,
    constants,
  };
}

export type AppServices = ReturnType<typeof createServices>;

const ServicesContext = createContext<AppServices | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services] = useState(createServices);

  useEffect(() => {
    services.clock.start();
    services.installService.start();
    services.design.load();
    services.design.watch();
    services.habits.load();
    services.installRepository.start();
    return () => {
      services.clock.stop();
      services.habits.dispose();
    };
  }, [services]);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices must be used within <ServicesProvider>');
  return services;
}

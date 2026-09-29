/**
 * app/services — the composition root (Flutter's `di.dart` / Provider wiring).
 *
 * Everything is constructed once, here, and handed down: services (storage,
 * clock, device, install, celebration) → repositories → view models. No module
 * reaches for a global; the wiring is visible in one place, which is what makes
 * the layers swappable and testable.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LocalStorageService } from '../data/services/local_storage_service.ts';
import { ClockService } from '../data/services/clock_service.ts';
import { DeviceService } from '../data/services/device_service.ts';
import { InstallService } from '../data/services/install_service.ts';
import { CelebrationService } from '../data/services/celebration_service.ts';
import { HabitsRepository } from '../data/repositories/habits_repository.ts';
import { DesignLanguageRepository } from '../data/repositories/design_language_repository.ts';
import { InstallRepository } from '../data/repositories/install_repository.ts';
import { TodayViewModel } from '../ui/today/view_models/today_view_model.ts';
import { StatsViewModel } from '../ui/stats/view_models/stats_view_model.ts';
import { SettingsViewModel } from '../ui/settings/view_models/settings_view_model.ts';
import { InstallViewModel } from '../ui/install/view_models/install_view_model.ts';
import { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } from '../domain/models/habit.ts';

export interface DomainConstants {
  DEFAULT_EMOJI: string;
  EMOJI_PRESETS: readonly string[];
  NAME_MAX_LENGTH: number;
}

export interface AppServices {
  storage: LocalStorageService;
  clock: ClockService;
  device: DeviceService;
  installService: InstallService;
  celebration: CelebrationService;
  habits: HabitsRepository;
  design: DesignLanguageRepository;
  installRepository: InstallRepository;
  today: TodayViewModel;
  stats: StatsViewModel;
  settings: SettingsViewModel;
  install: InstallViewModel;
  constants: DomainConstants;
}

const APP_PREFIX = 'streaks';

export function createServices(): AppServices {
  const storage = new LocalStorageService(APP_PREFIX);
  const clock = new ClockService();
  const device = new DeviceService();
  const installService = new InstallService();
  const celebration = new CelebrationService();

  const habits = new HabitsRepository(storage, clock);
  const design = new DesignLanguageRepository(storage, device);
  const installRepository = new InstallRepository(installService, storage, device);

  return {
    storage,
    clock,
    device,
    installService,
    celebration,
    habits,
    design,
    installRepository,
    today: new TodayViewModel(habits, celebration),
    stats: new StatsViewModel(habits),
    settings: new SettingsViewModel(design, installRepository, habits),
    install: new InstallViewModel(installRepository),
    constants: { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH },
  };
}

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
      services.design.dispose();
    };
  }, [services]);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices must be used within <ServicesProvider>');
  return services;
}

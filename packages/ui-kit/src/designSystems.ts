/**
 * The design languages this kit can render.
 *
 * Names describe *design languages*, not the libraries behind them — the app
 * (and the user) never speaks in Framework7's internal `ios` / `md` terms.
 * `kit` says which engine draws it; `theme` is that engine's own theme id and
 * only ever appears inside the Framework7 adapter.
 */
import type { DesignLanguageDescriptor, DesignOption, DesignSystem } from './types.ts';

export type { DesignLanguageDescriptor, DesignOption, DesignSystem } from './types.ts';

export const DESIGN_SYSTEMS = ['cupertino', 'material', 'fluent', 'yaru', 'custom', 'shadcn'] as const;

export const DEFAULT_DESIGN = 'custom' as const;

const KNOWN: readonly string[] = DESIGN_SYSTEMS;

export const isDesignSystem = (value: unknown): value is DesignSystem =>
  typeof value === 'string' && KNOWN.includes(value);

export const DESIGN_LANGUAGES: Record<DesignSystem, DesignLanguageDescriptor> = {
  cupertino: { kit: 'framework7', theme: 'ios', family: 'Apple', platform: 'iOS · macOS' },
  material: { kit: 'framework7', theme: 'md', family: 'Google', platform: 'Android' },
  fluent: { kit: 'fluent', family: 'Microsoft', platform: 'Windows' },
  yaru: { kit: 'code', theme: 'yaru', family: 'Ubuntu', platform: 'Linux' },
  custom: { kit: 'code', theme: 'custom', family: 'Streaks', platform: 'any' },
  shadcn: { kit: 'code', theme: 'shadcn', family: 'shadcn/ui', platform: 'web' },
};

export const DESIGN_OPTIONS: DesignOption[] = [
  { value: null, label: 'Auto (detect)' },
  { value: 'cupertino', label: 'Cupertino · iOS / macOS' },
  { value: 'material', label: 'Material · Android' },
  { value: 'fluent', label: 'Fluent · Windows' },
  { value: 'yaru', label: 'Yaru · Ubuntu' },
  { value: 'custom', label: 'Custom · Streaks' },
  { value: 'shadcn', label: 'shadcn/ui · neutral' },
];

/** Which design language an installed PWA gets on each OS. */
const INSTALLED_DESIGN: Record<string, DesignSystem> = {
  ios: 'cupertino',
  macos: 'cupertino',
  android: 'material',
  windows: 'fluent',
  linux: 'yaru',
};

/**
 * Explicit override wins, then the OS-native language for installed PWAs,
 * then the app's own custom design for plain browser tabs.
 */
export function resolveDesignSystem({
  os,
  installed,
  override,
}: {
  os: string;
  installed: boolean;
  override?: DesignSystem | null;
}): DesignSystem {
  if (isDesignSystem(override)) return override;
  if (!installed) return DEFAULT_DESIGN;
  return INSTALLED_DESIGN[os] ?? DEFAULT_DESIGN;
}

export const languageOf = (designSystem: unknown): DesignLanguageDescriptor =>
  DESIGN_LANGUAGES[isDesignSystem(designSystem) ? designSystem : DEFAULT_DESIGN];

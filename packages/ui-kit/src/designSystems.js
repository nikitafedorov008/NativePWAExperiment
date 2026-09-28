/**
 * The design languages this kit can render.
 *
 * Names describe *design languages*, not the libraries behind them — the app
 * (and the user) never speaks in Framework7's internal `ios` / `md` terms.
 * `kit` says which engine draws it, `theme` is that engine's own theme id.
 */
export const DESIGN_SYSTEMS = ['cupertino', 'material', 'fluent', 'yaru', 'custom', 'shadcn'];

export const DEFAULT_DESIGN = 'custom';

export const DESIGN_LANGUAGES = {
  cupertino: { kit: 'framework7', theme: 'ios', family: 'Apple', platform: 'iOS · macOS' },
  material: { kit: 'framework7', theme: 'md', family: 'Google', platform: 'Android' },
  fluent: { kit: 'fluent', family: 'Microsoft', platform: 'Windows' },
  yaru: { kit: 'code', theme: 'yaru', family: 'Ubuntu', platform: 'Linux' },
  custom: { kit: 'code', theme: 'custom', family: 'Streaks', platform: 'any' },
  shadcn: { kit: 'code', theme: 'shadcn', family: 'shadcn/ui', platform: 'web' },
};

export const DESIGN_OPTIONS = [
  { value: null, label: 'Auto (detect)' },
  { value: 'cupertino', label: 'Cupertino · iOS / macOS' },
  { value: 'material', label: 'Material · Android' },
  { value: 'fluent', label: 'Fluent · Windows' },
  { value: 'yaru', label: 'Yaru · Ubuntu' },
  { value: 'custom', label: 'Custom · Streaks' },
  { value: 'shadcn', label: 'shadcn/ui · neutral' },
];

/* Which design language an installed PWA gets on each OS. */
const INSTALLED_DESIGN = {
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
export function resolveDesignSystem({ os, installed, override }) {
  if (DESIGN_SYSTEMS.includes(override)) return override;
  if (!installed) return DEFAULT_DESIGN;
  return INSTALLED_DESIGN[os] ?? DEFAULT_DESIGN;
}

export const languageOf = (designSystem) => DESIGN_LANGUAGES[designSystem] ?? DESIGN_LANGUAGES[DEFAULT_DESIGN];

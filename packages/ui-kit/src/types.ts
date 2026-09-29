/**
 * types.ts — the kit's own contracts.
 *
 * The kit deliberately does not import application types: everything it needs
 * from the host is described here, and TypeScript's structural typing checks
 * that the app's objects satisfy these shapes when it builds the `KitApi` in
 * `src/app/App.tsx`. That keeps the package liftable into another project.
 */
import type { ReactNode } from 'react';

/* ---------- design languages ---------- */

export type DesignSystem = 'cupertino' | 'material' | 'fluent' | 'yaru' | 'custom' | 'shadcn';
export type KitEngine = 'framework7' | 'fluent' | 'code';
/** Design languages the code kit draws itself. */
export type CodeLanguage = 'custom' | 'shadcn' | 'yaru';

export interface DesignLanguageDescriptor {
  kit: KitEngine;
  /** Engine-internal theme id (Framework7's `ios` / `md`), never an app-facing name. */
  theme?: string;
  family: string;
  platform: string;
}

export interface DesignOption {
  value: DesignSystem | null;
  label: string;
}

/* ---------- domain shapes the screens render ---------- */

/** Local calendar day, `YYYY-MM-DD`. */
export type DateKey = string;

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: DateKey;
  completions: DateKey[];
}

export interface WeekDay {
  date: DateKey;
  done: boolean;
  weekday: string;
  dayOfMonth: number;
  isToday: boolean;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  doneCount: number;
  weekStrip: WeekDay[];
}

export interface DayProgress {
  done: number;
  total: number;
  ratio: number;
}

export interface BestStreakHabit {
  id: string;
  name: string;
  emoji: string;
  bestStreak: number;
}

export interface OverallStats {
  totalCompletions: number;
  bestStreakHabit: BestStreakHabit | null;
  perfectDays7: number;
  completionRate7: number;
}

/* ---------- what the host app injects ---------- */

export interface HabitInput {
  name: string;
  emoji?: string;
}

export interface HabitsApi {
  habits: Habit[];
  todayLabel: string;
  progress: DayProgress;
  overall: OverallStats;
  statsFor(id: string): HabitStats | null;
  addHabit(input: HabitInput): boolean;
  renameHabit(id: string, input: HabitInput): boolean;
  removeHabit(id: string): boolean;
  toggle(id: string, dateKey: DateKey): void;
  toggleToday(id: string): void;
  resetAll(): void;
}

export interface InstallApi {
  canPrompt: boolean;
  promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'>;
  outcome: 'accepted' | 'dismissed' | null;
  installed: boolean;
  dismissed: boolean;
  dismiss(): void;
  undismiss(): void;
  instructions: { title: string; steps: string[] };
}

export interface PlatformApi {
  os: string;
  browser: string;
  displayMode: string;
  installed: boolean;
  designSystem: DesignSystem;
  override: DesignSystem | null;
  setOverride(value: DesignSystem | null): void;
  isTouch: boolean;
  prefersDark: boolean;
}

export interface DomainConstants {
  DEFAULT_EMOJI: string;
  EMOJI_PRESETS: readonly string[];
  NAME_MAX_LENGTH: number;
}

export interface KitApi {
  habits: HabitsApi;
  install: InstallApi;
  platform: PlatformApi;
  constants: DomainConstants;
}

export interface KitApiProviderProps {
  api: KitApi;
  children: ReactNode;
}

/* ---------- theme tokens ---------- */

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  text2: string;
  divider: string;
  border: string;
  fill: string;
  scrim: string;
  brand: string;
  onBrand: string;
  brandSoft: string;
  danger: string;
  onDanger: string;
}

export interface TypeStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  fontFamily: string;
}

export type TypeVariant = 'display' | 'title' | 'headline' | 'body' | 'caption' | 'label';

export type TypeScale = Record<TypeVariant, TypeStyle>;

export interface Radii {
  card: number;
  button: number;
  control: number;
  dialog: number;
  input: number;
}

export interface ThemeBehavior {
  appBarTitle: 'center' | 'leading';
  appBar: 'flat' | 'blur' | 'headerbar';
  fab: boolean;
  checkbox: 'circle' | 'square';
  tabBar: 'blur' | 'pill' | 'plain';
  progressBarHeight: number;
  fabShape: number;
}

export interface Theme {
  language: CodeLanguage;
  dark: boolean;
  color: Palette;
  type: TypeScale;
  radius: Radii;
  behavior: ThemeBehavior;
}

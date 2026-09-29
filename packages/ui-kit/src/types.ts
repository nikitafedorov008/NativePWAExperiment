/**
 * types.ts — the kit's own contracts.
 *
 * The kit deliberately does not import application types: everything it needs
 * from the host is described here — the view models it renders, the appearance
 * it themes with, and the constants the forms use. TypeScript's structural
 * typing then checks that the host object satisfies these shapes when it builds
 * the `KitApi` in `src/app/App.tsx`, so the package stays liftable into another
 * project. Views are dumb by contract: they read `state` and call commands.
 */
import type { ReactNode } from 'react';
import type { StoreApi } from 'zustand';

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

export interface Appearance {
  designSystem: DesignSystem;
  prefersDark: boolean;
}

/* ---------- domain shapes the views render ---------- */

/** Local calendar day, `YYYY-MM-DD`. */
export type DateKey = string;

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: DateKey;
  completions: DateKey[];
}

export interface HabitInput {
  name: string;
  emoji?: string;
}

export interface WeekDay {
  date: DateKey;
  done: boolean;
  weekday: string;
  dayOfMonth: number;
  isToday: boolean;
}

/* ---------- observable / view-model contracts ---------- */

/**
 * View models and repositories are plain zustand stores: they live outside
 * React (so the domain and data layers stay framework-free) and views read them
 * with `useStore` — the ecosystem-standard subscription React itself points to.
 */
export type Observable<T> = StoreApi<T>;

export interface TodayItem {
  id: string;
  name: string;
  emoji: string;
  doneToday: boolean;
  streak: number;
  days: WeekDay[];
}

export interface TodayState {
  todayLabel: string;
  progress: { done: number; total: number; ratio: number };
  items: TodayItem[];
  editor: { open: boolean; habit: Habit | null };
}

export interface TodayActions {
  toggleToday(id: string): void;
  toggleDay(id: string, dateKey: DateKey): void;
  remove(id: string): void;
  /** Pass a habit id to edit one, `null` to create a new one. */
  openEditor(id: string | null): void;
  closeEditor(): void;
  submitEditor(input: HabitInput): boolean;
}

export type TodayViewModelApi = Observable<TodayState & TodayActions>;

export interface StatsItem {
  id: string;
  name: string;
  emoji: string;
  summary: string;
  days: WeekDay[];
}

export interface StatsState {
  tiles: { label: string; value: string }[];
  items: StatsItem[];
}

export type StatsViewModelApi = Observable<StatsState>;

export interface InstallState {
  canPrompt: boolean;
  installed: boolean;
  outcome: 'accepted' | 'dismissed' | null;
  dismissed: boolean;
  visible: boolean;
  instructions: { title: string; steps: string[] };
}

export interface InstallActions {
  dismiss(): void;
  prompt(): void;
}

export type InstallViewModelApi = Observable<InstallState & InstallActions>;

export interface SettingsState {
  rows: { label: string; value: string }[];
  design: { current: DesignSystem; override: DesignSystem | null; options: DesignOption[] };
  install: InstallState;
  resetOpen: boolean;
}

export interface SettingsActions {
  setDesign(value: DesignSystem | null): void;
  requestReset(): void;
  cancelReset(): void;
  confirmReset(): void;
  dismissInstall(): void;
  promptInstall(): void;
}

export type SettingsViewModelApi = Observable<SettingsState & SettingsActions>;

export interface DomainConstants {
  DEFAULT_EMOJI: string;
  EMOJI_PRESETS: readonly string[];
  NAME_MAX_LENGTH: number;
}

export interface KitApi {
  today: TodayViewModelApi;
  stats: StatsViewModelApi;
  settings: SettingsViewModelApi;
  install: InstallViewModelApi;
  appearance: Appearance;
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

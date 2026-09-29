/**
 * @native-pwa-experiment/ui-kit — public API.
 *
 * Usage in an app:
 *
 *   import { KitApiProvider, Root } from '@native-pwa-experiment/ui-kit';
 *
 *   <KitApiProvider api={{ habits, install, platform, constants }}>
 *     <Root />
 *   </KitApiProvider>
 *
 * `Root` renders the design language the platform layer resolved and lazily
 * loads exactly one implementation (Framework7, Fluent UI, or the code kit).
 * `KitApi` is the contract the host object must satisfy — it is checked by
 * TypeScript, and the kit never imports application code.
 */
export { default as Root } from './Root.tsx';
export { default as Splash } from './Splash.tsx';

export { KitApiProvider } from './KitApiProvider.tsx';
export { useKitApi, useHabits, useInstall, usePlatform, useDomainConstants } from './context.ts';

export {
  DESIGN_SYSTEMS,
  DESIGN_LANGUAGES,
  DESIGN_OPTIONS,
  DEFAULT_DESIGN,
  resolveDesignSystem,
  languageOf,
  isDesignSystem,
} from './designSystems.ts';

export { ThemeProvider, useTheme, resolveTheme } from './theme.tsx';

export {
  Scaffold,
  AppBar,
  NavigationBar,
  Fab,
  Button,
  IconButton,
  Checkbox,
  TextInput,
  Card,
  ListTile,
  Divider,
  ProgressBar,
  Badge,
  Radio,
  Dialog,
  Text,
  Icon,
} from './widgets.tsx';

export { injectAppStyles } from './appStyles.ts';

export type {
  DesignSystem,
  CodeLanguage,
  DesignLanguageDescriptor,
  DesignOption,
  DateKey,
  Habit,
  HabitInput,
  HabitsApi,
  WeekDay,
  HabitStats,
  DayProgress,
  BestStreakHabit,
  OverallStats,
  InstallApi,
  PlatformApi,
  DomainConstants,
  KitApi,
  Palette,
  TypeStyle,
  TypeVariant,
  TypeScale,
  Radii,
  ThemeBehavior,
  Theme,
} from './types.ts';

export type {
  AppBarProps,
  BadgeProps,
  ButtonProps,
  CardProps,
  CheckboxProps,
  DialogProps,
  FabProps,
  IconButtonProps,
  IconComponent,
  IconProps,
  ListTileProps,
  NavItem,
  NavigationBarProps,
  ProgressBarProps,
  RadioProps,
  ScaffoldProps,
  TextInputProps,
  TextProps,
} from './widgets.tsx';

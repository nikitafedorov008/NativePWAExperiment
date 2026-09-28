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
 */
export { default as Root } from './Root.jsx';
export { default as Splash } from './Splash.jsx';

export { KitApiProvider } from './KitApiProvider.jsx';
export { useKitApi, useHabits, useInstall, usePlatform, useDomainConstants } from './context.js';

export {
  DESIGN_SYSTEMS,
  DESIGN_LANGUAGES,
  DESIGN_OPTIONS,
  DEFAULT_DESIGN,
  resolveDesignSystem,
  languageOf,
} from './designSystems.js';

export { ThemeProvider, useTheme, resolveTheme } from './theme.jsx';

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
} from './widgets.jsx';

export { injectAppStyles } from './appStyles.js';

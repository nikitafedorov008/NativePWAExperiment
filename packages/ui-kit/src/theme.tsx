/**
 * theme.tsx — the single style source for the code kit (ThemeData in Flutter
 * terms). Every token below is data: a design language × light/dark palette,
 * a behavior block (`.adaptive`-style switches), and a type scale. Widgets in
 * widgets.tsx read these through useTheme() and style themselves inline.
 *
 * Three languages are implemented here — `custom` (the app's own brand),
 * `shadcn` (neutral zinc), `yaru` (Ubuntu). Cupertino, Material and Fluent are
 * drawn by their own engines instead.
 */
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { usePlatform } from './context.ts';
import { DEFAULT_DESIGN, DESIGN_LANGUAGES } from './designSystems.ts';
import type {
  CodeLanguage,
  DesignSystem,
  Palette,
  Theme,
  ThemeBehavior,
  TypeScale,
} from './types.ts';

const isCodeLanguage = (value: DesignSystem): value is CodeLanguage =>
  DESIGN_LANGUAGES[value].kit === 'code';

const FONTS: Record<CodeLanguage, string> = {
  custom: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  shadcn: "'Geist', 'Inter', system-ui, -apple-system, sans-serif",
  yaru: "'Ubuntu', 'Ubuntu Sans', Cantarell, 'Noto Sans', system-ui, sans-serif",
};

interface Scheme {
  light: Palette;
  dark: Palette;
}

const SCHEMES: Record<CodeLanguage, Scheme> = {
  /* The app's own design: Streaks brand blue, soft neutral surfaces. */
  custom: {
    light: {
      background: '#f5f7fb', surface: '#ffffff', surfaceAlt: '#eef1f7',
      text: '#0d1117', text2: 'rgba(13,17,23,0.58)', divider: 'rgba(13,17,23,0.12)',
      border: 'rgba(13,17,23,0.10)', fill: 'rgba(13,17,23,0.05)', scrim: 'rgba(0,0,0,0.42)',
      brand: '#0057ff', onBrand: '#ffffff', brandSoft: 'rgba(0,87,255,0.10)',
      danger: '#d92d20', onDanger: '#ffffff',
    },
    dark: {
      background: '#0b0d12', surface: '#141821', surfaceAlt: '#1c2230',
      text: '#eef2f9', text2: 'rgba(238,242,249,0.60)', divider: 'rgba(238,242,249,0.14)',
      border: 'rgba(238,242,249,0.11)', fill: 'rgba(238,242,249,0.07)', scrim: 'rgba(0,0,0,0.58)',
      brand: '#4d8dff', onBrand: '#08122b', brandSoft: 'rgba(77,141,255,0.16)',
      danger: '#ff6b5e', onDanger: '#2b0a07',
    },
  },
  /* shadcn/ui defaults: zinc neutrals, near-black primary, 10px radius. */
  shadcn: {
    light: {
      background: '#fafafa', surface: '#ffffff', surfaceAlt: '#f4f4f5',
      text: '#18181b', text2: 'rgba(24,24,27,0.56)', divider: 'rgba(24,24,27,0.10)',
      border: 'rgba(24,24,27,0.09)', fill: 'rgba(24,24,27,0.05)', scrim: 'rgba(0,0,0,0.40)',
      brand: '#18181b', onBrand: '#fafafa', brandSoft: 'rgba(24,24,27,0.07)',
      danger: '#dc2626', onDanger: '#ffffff',
    },
    dark: {
      background: '#0a0a0a', surface: '#18181b', surfaceAlt: '#242428',
      text: '#fafafa', text2: 'rgba(250,250,250,0.56)', divider: 'rgba(250,250,250,0.13)',
      border: 'rgba(250,250,250,0.11)', fill: 'rgba(250,250,250,0.07)', scrim: 'rgba(0,0,0,0.60)',
      brand: '#fafafa', onBrand: '#18181b', brandSoft: 'rgba(250,250,250,0.09)',
      danger: '#ef4444', onDanger: '#ffffff',
    },
  },
  /* Yaru (Ubuntu): Ubuntu orange accent, Adwaita-like greys, tighter radii. */
  yaru: {
    light: {
      background: '#f6f5f4', surface: '#ffffff', surfaceAlt: '#efedec',
      text: '#2e3436', text2: 'rgba(46,52,54,0.62)', divider: 'rgba(46,52,54,0.14)',
      border: 'rgba(46,52,54,0.13)', fill: 'rgba(46,52,54,0.06)', scrim: 'rgba(0,0,0,0.42)',
      brand: '#e95420', onBrand: '#ffffff', brandSoft: 'rgba(233,84,32,0.12)',
      danger: '#c01c28', onDanger: '#ffffff',
    },
    dark: {
      background: '#242424', surface: '#303030', surfaceAlt: '#3a3a3a',
      text: '#ffffff', text2: 'rgba(255,255,255,0.62)', divider: 'rgba(255,255,255,0.14)',
      border: 'rgba(255,255,255,0.12)', fill: 'rgba(255,255,255,0.08)', scrim: 'rgba(0,0,0,0.55)',
      brand: '#f2764a', onBrand: '#2b1207', brandSoft: 'rgba(242,118,74,0.18)',
      danger: '#ff7b72', onDanger: '#3a0a06',
    },
  },
};

/* Behavior & shapes per language — the `.adaptive` constructors of this kit. */
const BEHAVIOR: Record<CodeLanguage, ThemeBehavior> = {
  custom: {
    appBarTitle: 'leading', appBar: 'flat', fab: false, checkbox: 'square', tabBar: 'pill',
    progressBarHeight: 6, fabShape: 0,
  },
  shadcn: {
    appBarTitle: 'leading', appBar: 'flat', fab: false, checkbox: 'square', tabBar: 'plain',
    progressBarHeight: 6, fabShape: 0,
  },
  yaru: {
    appBarTitle: 'leading', appBar: 'headerbar', fab: false, checkbox: 'square', tabBar: 'plain',
    progressBarHeight: 6, fabShape: 0,
  },
};

const RADII: Record<CodeLanguage, Theme['radius']> = {
  custom: { card: 14, button: 10, control: 6, dialog: 14, input: 10 },
  shadcn: { card: 14, button: 10, control: 6, dialog: 14, input: 10 },
  yaru: { card: 8, button: 6, control: 6, dialog: 12, input: 6 },
};

const typography = (family: string): TypeScale => ({
  display: { fontSize: 26, fontWeight: 650, lineHeight: 1.2, fontFamily: family },
  title: { fontSize: 20, fontWeight: 600, lineHeight: 1.25, fontFamily: family },
  headline: { fontSize: 16, fontWeight: 600, lineHeight: 1.3, fontFamily: family },
  body: { fontSize: 15, fontWeight: 400, lineHeight: 1.45, fontFamily: family },
  caption: { fontSize: 12.5, fontWeight: 400, lineHeight: 1.4, fontFamily: family },
  label: { fontSize: 13.5, fontWeight: 550, lineHeight: 1.35, fontFamily: family },
});

export function resolveTheme({
  designSystem,
  prefersDark,
}: {
  designSystem?: DesignSystem | null;
  prefersDark?: boolean;
}): Theme {
  const language: CodeLanguage =
    designSystem && isCodeLanguage(designSystem) ? designSystem : DEFAULT_DESIGN;
  const dark = Boolean(prefersDark);
  return {
    language,
    dark,
    color: SCHEMES[language][dark ? 'dark' : 'light'],
    type: typography(FONTS[language]),
    radius: RADII[language],
    behavior: BEHAVIOR[language],
  };
}

/**
 * Interactive states (:hover/:focus) cannot be expressed inline, so the
 * provider emits one tiny <style> generated from the current theme.
 */
const globalStyles = (theme: Theme): string => `
  html, body { margin: 0; padding: 0; background: ${theme.color.background}; color: ${theme.color.text}; }
  html { -webkit-font-smoothing: antialiased; }
  body { min-height: 100dvh; }
  button, input { font: inherit; color: inherit; }
  button { cursor: pointer; border: 0; background: none; padding: 0; }
  button:disabled { cursor: default; }
  @media (hover: hover) {
    .pressable:hover:not(:disabled) { filter: brightness(${theme.dark ? '1.22' : '0.94'}); }
  }
  .pressable:active:not(:disabled) { filter: brightness(${theme.dark ? '1.32' : '0.88'}); }
  button:focus-visible, input:focus-visible { outline: 2px solid ${theme.color.brand === theme.color.text ? theme.color.text2 : theme.color.brand}; outline-offset: 2px; }
  input:focus-visible { outline-offset: 0; }
  .scaffold-scroll { scrollbar-width: none; }
  .scaffold-scroll::-webkit-scrollbar { display: none; }
`;

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { designSystem, prefersDark } = usePlatform();
  const theme = useMemo(
    () => resolveTheme({ designSystem, prefersDark }),
    [designSystem, prefersDark],
  );

  useEffect(() => {
    const el =
      document.getElementById('theme-style') ??
      document.head.appendChild(Object.assign(document.createElement('style'), { id: 'theme-style' }));
    el.textContent = globalStyles(theme);
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used within <ThemeProvider>');
  return theme;
}

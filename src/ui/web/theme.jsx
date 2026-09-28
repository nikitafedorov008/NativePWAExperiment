/**
 * theme.jsx — единственный источник стилей web-кита (аналог ThemeData во Flutter).
 * Токены описаны кодом для светлой/тёмной темы; виджеты читают их через useTheme()
 * и стилизуются инлайн-объектами.
 */
import { createContext, useContext, useEffect, useMemo } from 'react';
import { usePlatform } from '@/platform/PlatformContext.jsx';

const BRAND = '#0057ff';

const FONTS = {
  cupertino: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
  material: "Roboto, 'Segoe UI', system-ui, sans-serif",
  fluent: "'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif",
  web: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

/* Семантические палитры платформ × режимов. */
const SCHEMES = {
  cupertino: {
    light: {
      background: '#f2f2f7', surface: '#ffffff', surfaceAlt: '#e4e4e9',
      text: '#0b0b0c', text2: 'rgba(60,60,67,0.60)', divider: 'rgba(60,60,67,0.22)',
      border: 'rgba(60,60,67,0.14)', fill: 'rgba(120,120,128,0.14)', scrim: 'rgba(0,0,0,0.40)',
      brand: BRAND, onBrand: '#ffffff', brandSoft: 'rgba(0,87,255,0.12)',
      danger: '#d70015', onDanger: '#ffffff',
    },
    dark: {
      background: '#000000', surface: '#1c1c1e', surfaceAlt: '#2c2c2e',
      text: '#f5f5f7', text2: 'rgba(235,235,245,0.60)', divider: 'rgba(84,84,88,0.60)',
      border: 'rgba(84,84,88,0.45)', fill: 'rgba(120,120,128,0.26)', scrim: 'rgba(0,0,0,0.55)',
      brand: '#2b7bff', onBrand: '#ffffff', brandSoft: 'rgba(43,123,255,0.22)',
      danger: '#ff453a', onDanger: '#ffffff',
    },
  },
  material: {
    light: {
      background: '#f5f6f8', surface: '#ffffff', surfaceAlt: '#eceff3',
      text: '#191b1f', text2: 'rgba(25,27,31,0.62)', divider: 'rgba(25,27,31,0.13)',
      border: 'rgba(25,27,31,0.10)', fill: 'rgba(25,27,31,0.07)', scrim: 'rgba(0,0,0,0.45)',
      brand: BRAND, onBrand: '#ffffff', brandSoft: 'rgba(0,87,255,0.12)',
      danger: '#ba1a1a', onDanger: '#ffffff',
    },
    dark: {
      background: '#111318', surface: '#1d2025', surfaceAlt: '#282b31',
      text: '#e3e5e9', text2: 'rgba(227,229,233,0.62)', divider: 'rgba(227,229,233,0.15)',
      border: 'rgba(227,229,233,0.11)', fill: 'rgba(227,229,233,0.09)', scrim: 'rgba(0,0,0,0.60)',
      brand: '#9db9ff', onBrand: '#04226e', brandSoft: 'rgba(157,185,255,0.18)',
      danger: '#ffb4ab', onDanger: '#5f150f',
    },
  },
  fluent: {
    light: {
      background: '#f4f4f4', surface: '#ffffff', surfaceAlt: '#ececec',
      text: '#1a1a1a', text2: 'rgba(26,26,26,0.61)', divider: 'rgba(26,26,26,0.11)',
      border: 'rgba(26,26,26,0.09)', fill: 'rgba(26,26,26,0.055)', scrim: 'rgba(0,0,0,0.40)',
      brand: BRAND, onBrand: '#ffffff', brandSoft: 'rgba(0,87,255,0.10)',
      danger: '#b10e1c', onDanger: '#ffffff',
    },
    dark: {
      background: '#202020', surface: '#2b2b2b', surfaceAlt: '#343434',
      text: '#f3f3f3', text2: 'rgba(243,243,243,0.62)', divider: 'rgba(243,243,243,0.12)',
      border: 'rgba(243,243,243,0.09)', fill: 'rgba(243,243,243,0.065)', scrim: 'rgba(0,0,0,0.55)',
      brand: '#6cb2f9', onBrand: '#0b1f33', brandSoft: 'rgba(108,178,249,0.16)',
      danger: '#ff99a1', onDanger: '#390508',
    },
  },
  web: {
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
};

/* Поведение и формы платформ (аналог .adaptive-конструкторов во Flutter). */
const BEHAVIOR = {
  cupertino: {
    appBarTitle: 'center', fab: false, checkbox: 'circle', tabBar: 'blur',
    radius: { card: 12, button: 12, control: 999, dialog: 14, input: 10 },
    appBarBlur: true, progressBarHeight: 4, fabShape: 0,
  },
  material: {
    appBarTitle: 'leading', fab: true, checkbox: 'square', tabBar: 'pill',
    radius: { card: 16, button: 999, control: 4, dialog: 24, input: 10 },
    appBarBlur: false, progressBarHeight: 6, fabShape: 16,
  },
  fluent: {
    appBarTitle: 'leading', fab: false, checkbox: 'square', tabBar: 'plain',
    radius: { card: 8, button: 6, control: 4, dialog: 8, input: 6 },
    appBarBlur: false, progressBarHeight: 6, fabShape: 0,
  },
  web: {
    appBarTitle: 'leading', fab: false, checkbox: 'square', tabBar: 'plain',
    radius: { card: 14, button: 10, control: 6, dialog: 14, input: 10 },
    appBarBlur: false, progressBarHeight: 6, fabShape: 0,
  },
};

const typography = (family) => ({
  display: { fontSize: 26, fontWeight: 650, lineHeight: 1.2, fontFamily: family },
  title: { fontSize: 20, fontWeight: 600, lineHeight: 1.25, fontFamily: family },
  headline: { fontSize: 16, fontWeight: 600, lineHeight: 1.3, fontFamily: family },
  body: { fontSize: 15, fontWeight: 400, lineHeight: 1.45, fontFamily: family },
  caption: { fontSize: 12.5, fontWeight: 400, lineHeight: 1.4, fontFamily: family },
  label: { fontSize: 13.5, fontWeight: 550, lineHeight: 1.35, fontFamily: family },
});

export function resolveTheme({ designSystem, prefersDark }) {
  const platform = designSystem ?? 'web';
  const dark = Boolean(prefersDark);
  return {
    platform,
    dark,
    color: SCHEMES[platform][dark ? 'dark' : 'light'],
    type: typography(FONTS[platform]),
    radius: BEHAVIOR[platform].radius,
    behavior: BEHAVIOR[platform],
  };
}

/**
 * Интерактивные состояния (:hover/:focus) нельзя выразить инлайн-стилями,
 * поэтому провайдер генерирует единственный маленький <style> из темы.
 */
const globalStyles = (theme) => `
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

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { designSystem, prefersDark } = usePlatform();
  const theme = useMemo(() => resolveTheme({ designSystem, prefersDark }), [designSystem, prefersDark]);

  useEffect(() => {
    const el = document.getElementById('theme-style') ?? document.head.appendChild(
      Object.assign(document.createElement('style'), { id: 'theme-style' }),
    );
    el.textContent = globalStyles(theme);
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used within <ThemeProvider>');
  return theme;
}

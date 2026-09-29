# @native-pwa-experiment/ui-kit

Six design languages — **Cupertino, Material, Fluent, Yaru, custom, shadcn** — rendered by the same
habit-tracker UI. Written in TypeScript; the package ships its sources (`.ts` / `.tsx`) and its props
and contracts are typed.

| Design language | Engine | Native to |
|---|---|---|
| `cupertino` | Framework7 (`ios` theme) + Framework7 icon font | iOS · macOS |
| `material` | Framework7 (`md` theme) + material-icons | Android · ChromeOS |
| `fluent` | [@fluentui/react-components](https://react.fluentui.dev/) v9 | Windows |
| `yaru` | own code kit (see below) | Ubuntu · Linux |
| `custom` | own code kit | the app's own brand |
| `shadcn` | own code kit | neutral web look |

The **code kit** is a small Flutter-style widget set: primitives (`Scaffold`, `AppBar`, `Button`,
`Card`, `Dialog`, …) styled *only* from tokens in one file, `src/theme.jsx`. Adding a design language
means adding a palette + a behavior block there — no new components.

## Install & use

```bash
npm install @native-pwa-experiment/ui-kit    # or: npm i <path-to-this-folder>
```

```jsx
import { KitApiProvider, Root } from '@native-pwa-experiment/ui-kit';

export default function App() {
  return (
    <KitApiProvider api={{ habits, install, platform, constants }}>
      <Root />
    </KitApiProvider>
  );
}
```

### What the host app must inject

The kit never imports application code — the app hands it everything the screens need:

| Key | What it provides |
|---|---|
| `habits` | `habits`, `todayLabel`, `progress`, `overall`, `statsFor`, `addHabit`, `renameHabit`, `removeHabit`, `toggle`, `toggleToday`, `resetAll` |
| `install` | `canPrompt`, `promptInstall`, `outcome`, `instructions`, `installed`, `dismissed`, `dismiss`, `undismiss` |
| `platform` | `os`, `browser`, `displayMode`, `installed`, `designSystem`, `override`, `setOverride`, `prefersDark`, `isTouch` |
| `constants` | `EMOJI_PRESETS`, `DEFAULT_EMOJI`, `NAME_MAX_LENGTH` |

`platform.designSystem` selects which language `Root` renders.

### Choosing a design language

```js
import { resolveDesignSystem, DESIGN_SYSTEMS, DESIGN_OPTIONS } from '@native-pwa-experiment/ui-kit/design-systems';

resolveDesignSystem({ os: 'linux', installed: true, override: null }); // 'yaru'
resolveDesignSystem({ os: 'ios', installed: false, override: 'shadcn' }); // 'shadcn'
```

- `DESIGN_SYSTEMS` — the six ids, in display order.
- `DESIGN_OPTIONS` — ready-made radio options for a settings screen (`null` = auto-detect).
- `DESIGN_LANGUAGES` — per-id descriptor: which engine draws it and which family/platform it belongs to.
- Installed apps get their OS-native language; browser tabs get `custom`; an explicit override always wins.

## Pieces you can use standalone

```jsx
import { ThemeProvider, useTheme, Button, Card, Dialog, ProgressBar } from '@native-pwa-experiment/ui-kit';
```

`ThemeProvider` + `useTheme()` expose the active language's tokens (`color`, `type`, `radius`,
`behavior`), and every widget in `src/widgets.jsx` is a plain component you can compose on its own.
`injectAppStyles()` adds the stylesheet the widgets need (idempotent; also called for you by `Root`).

## Styles

| Layer | Where it lives |
|---|---|
| Framework7 / Fluent UI | their own styling (CSS bundle / CSS-in-JS tokens) |
| Code kit widgets | inline styles from `src/theme.jsx` |
| Habit-specific widgets (check circle, week strip, emoji grid, stat tiles) | `src/appStyles.js` — one file, one injected `<style>`, rules scoped under `.framework7-root` / `.fluent-app` |

There are no `.css` files in the package.

## Layout

```
src/
  index.js              public API (this is what you import)
  designSystems.js      the six languages, resolver, options
  context.js            injectable app API (hooks)
  KitApiProvider.jsx    provider for that API
  Root.jsx              adaptive switcher: id → lazy implementation
  theme.jsx             design tokens for the code kit (custom · shadcn · yaru)
  widgets.jsx           code kit primitives
  appStyles.js          the one custom stylesheet, injected
  Splash.jsx            chunk-loading splash
  kits/
    framework7/         cupertino.jsx · material.jsx · App.jsx (shared shell) · screens/
    fluent/             Root.jsx · screens/ · components/
    code/               Root.jsx · screens/ · components/  (custom · shadcn · yaru)
```

Each design language is a lazy chunk: a browser tab never downloads Framework7, and an installed
Android user never downloads Fluent UI.

## License

MIT — see the repository root.

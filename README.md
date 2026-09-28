# Native PWA Experiment

![Native PWA Experiment](docs/assets/readme-hero.png)

**A proof of concept that a progressive web app in 2026 can be indistinguishable from a native mobile or desktop application — including the UI itself.**

This repository is a companion to [whatpwacando.today](https://whatpwacando.today/). That site catalogs *what* browsers can do today; this experiment demonstrates *how it feels*: one synthetic app, shipped as a PWA, that installs to your home screen / dock, works offline, and — the centerpiece — renders itself with the **native UI kit of your platform**.

## The demo app: Streaks

A small but complete daily habit tracker (progress, streaks, per-day history, add/rename/delete, celebrations). The UI kit is chosen **at runtime**:

- installed on **iOS / macOS** → **Cupertino** (Framework7 `ios`)
- installed on **Android / Linux** → **Material** (Framework7 `md`)
- installed on **Windows** → **Fluent** (`@fluentui/react-components` v9)
- in a plain **browser tab** → a lightweight **web kit** (a Flutter-style widget set styled from a single theme file)

You can force any look for a preview: `?design=cupertino|material|fluent|web` (persisted, changeable later in Settings).

<p align="center">
  <img src="docs/assets/readme-app.png" alt="The same app in four native looks" width="900" />
</p>

## How it works

<p align="center">
  <img src="docs/assets/readme-architecture.png" alt="Architecture: one domain layer, swappable UI kits" width="900" />
</p>

- **`src/domain`** — pure habit logic: a reducer, versioned localStorage persistence, streak/progress selectors. Zero UI imports, fully unit-tested (80 tests).
- **`src/platform`** — detects OS, browser, display mode and install status; resolves the design system (explicit override → installed → web) and owns the captured `beforeinstallprompt` flow with per-browser install instructions.
- **`src/app`** — an adaptive switcher that lazy-loads exactly one UI implementation, so a browser tab never downloads Framework7 and an installed Android user never downloads Fluent.
- **`src/ui`** — the three implementations:
  - `f7/` — a shared Framework7 shell rendering Cupertino **and** Material from one component tree (`theme="ios" | "md"`), with swipe-to-delete, FAB, system dialogs and platform icon fonts;
  - `fluent/` — real Fluent v9 widgets whose styling is CSS-in-JS driven by design tokens;
  - `web/` — a Flutter-style widget kit (`theme.jsx` + `widgets.jsx`) where all styling is inline from code — the browser-tab fallback and the "how elegant can this be" exhibit.
- **`src/ui/appStyles.js`** — every custom style the kits don't provide (habit check circles, week strips, emoji grid), injected as a single stylesheet, scoped per kit (`.framework7-root` / `.fluent-app`). No `.css` files in the app.

### What makes it feel native

| Detail | How |
|---|---|
| Installed-mode detection | `display-mode` media queries + `navigator.standalone` switch the whole design system on launch |
| Real install flow | captured `beforeinstallprompt` re-fired from a button; iOS gets per-browser step lists |
| Offline | vite-plugin-pwa service worker precaches the build (`autoUpdate`) |
| Native chrome | safe-area insets, system dark mode, platform typography and icon fonts |
| Platform widgets | FAB + pill tabs (Material), circular checks + swipe-to-delete (Cupertino), `TabList` (Fluent) |

## Run it locally

```bash
git clone https://github.com/nikitafedorov008/NativePWAExperiment
cd NativePWAExperiment
npm install
npm run dev      # http://localhost:5173
npm run build    # static dist/ — host anywhere
npm test         # 80 unit tests
```

Open the dev URL in a browser tab for the web look — then **install** the app (banner or browser menu) and launch it from your home screen / dock to see your platform's native UI.

## Presentation

A short slide deck about the experiment is included and downloadable:

- [`docs/presentation.pdf`](docs/presentation.pdf) — ready to view/share
- [`docs/slides.html`](docs/slides.html) — the editable source (open in any browser)

## Related solutions & real-world PWAs

- [What PWA Can Do Today](https://whatpwacando.today/) — the capability catalog this experiment pairs with
- [Excalidraw](https://excalidraw.com/) · [Squoosh](https://squoosh.app/) — flagship installable, offline-capable PWAs
- [Starbucks PWA](https://www.starbucks.com/) · [Uber](https://m.uber.com/) · [X](https://x.com/) — production PWAs at scale
- [Framework7](https://framework7.io/) · [Fluent UI React v9](https://react.fluentui.dev/) — the kits that make native looks possible from web code
- [Learn PWA (web.dev)](https://web.dev/learn/pwa) · [PWA Stats](https://www.pwastats.com/) — reference material and field statistics

## Scope & honest caveats

A PWA is not a replacement for apps that need deep OS integration (background services, full hardware access, store-only APIs). It **is** a serious answer for everything else — and this repository exists to show how close the gap already is.

## License

[MIT](LICENSE)

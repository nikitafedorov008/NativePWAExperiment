# Architecture

This project follows **Flutter's recommended app architecture** — the layered MVVM described in
[Flutter's architecture guide](https://docs.flutter.dev/app-architecture/guide) and laid out in
[`flutter/samples/compass_app`](https://github.com/flutter/samples/tree/main/compass_app). The app is
React + TypeScript, but the shape is Flutter's, so the reasoning transfers one-to-one.

## The layers

| Layer | Holds | Flutter name |
|---|---|---|
| **UI** | views (dumb) + view models (state & commands) | `ui/<feature>/widgets` + `ui/<feature>/view_models` |
| **Data** | repositories (source of truth, caching, persistence) + services (one per external source, stateless) | `data/repositories` + `data/services` |
| **Domain** | entities, value objects, rules and read models | `domain/models` + `domain/use_cases` |
| *support* | framework primitives (ChangeNotifier) and small helpers | `core/`, `utils/` |

Rules the code holds to:

- A **view** renders state and calls commands. No business logic, no derivation — if it computes, it
  belongs in the view model.
- A **view model** is one per view. It reads repositories, turns entities into presentation-ready
  items, owns transient UI state (open/closed, in-progress text) and exposes commands.
- A **repository** is the single source of truth for one kind of data. It persists through services,
  never knows about other repositories, and republishes its state on every change.
- A **service** wraps one external thing (localStorage, `matchMedia`, the install event, the clock,
  confetti). It holds no domain state and never throws at the caller.
- **Use cases** own the rules that must not be duplicated (a name is required, a future day cannot be
  completed, an unknown id is rejected). Expected failures come back as `Result`, not exceptions.
- Everything is constructed once in the **composition root**; nothing reaches for a global.

### State lives in zustand stores

Repositories, services and view models are plain [zustand](https://zustand.docs.pmnd.rs/) stores
(`createStore` from `zustand/vanilla`), which keeps them **outside React** — the layering above only
works because `domain/` and `data/` never import a component library. Views subscribe with
`useStore(store)`, which is the ecosystem-standard subscription that React's own
`useSyncExternalStore` is built for.

```tsx
const today = useTodayViewModel();                       // the store, not a hook value
const { items, progress } = useStore(today);             // data
const toggleToday = useStore(today, (s) => s.toggleToday); // commands
```

Action methods live in the same store as the state they change, which is the usual zustand shape and
keeps every view to a single hook call per store.

## Mapping, side by side

| Flutter | Here |
|---|---|
| `main.dart` | `src/main.tsx` |
| `lib/config/` | `src/core/` — framework-level primitives |
| `lib/utils/` | `src/utils/` — date keys and other small helpers |
| `domain/models/*.dart` | `src/domain/models/habit.ts`, `result.ts` |
| `domain/use_cases/*.dart` | `src/domain/use_cases/habits.ts` — write rules + read models |
| `data/services/*.dart` | `src/data/services/` — storage, clock, device, install, celebration |
| `data/models/*.dto.dart` | `src/data/models/habit_dto.ts` — versioned envelope, `fromJson`/`toJson` |
| `data/repositories/*.dart` | `src/data/repositories/` — habits, design language, install |
| `ui/<feature>/view_models/*.dart` | `src/ui/<feature>/view_models/*.ts` |
| `ui/core/widgets/` | `packages/ui-kit` — shared widgets, plus the six design languages |
| `di.dart` / `Provider`s at the root | `src/app/services.tsx` |
| `ChangeNotifier` + `ListenableBuilder` | a zustand store + `useStore` from `zustand` |
| `ThemeData` + `MaterialApp`/`CupertinoApp` | `packages/ui-kit/src/theme.tsx` + the language registry |

Flutter's `Result`-style error handling is `src/domain/models/result.ts`: repositories and use cases
return `Result<T>`, so "empty name", "future date" or "unknown habit" are values a view model can
decide about, and only genuinely unexpected errors propagate.

## Where the six design languages fit

Flutter keeps one widget tree and swaps `ThemeData` (and offers `.adaptive` constructors where the
platform widgets differ). This project pushes that idea further: **view models are written once, views
exist per design language.**

```
view model (one)          views (three)
TodayViewModel    ──┬──►   kits/framework7/screens/Today.tsx   (cupertino, material)
   state: items,    │      kits/fluent/screens/Today.tsx       (fluent)
   progress, editor │      kits/code/screens/Today.tsx         (custom, shadcn, yaru)
   commands: …      └──►   …all reading the same state, calling the same commands
```

That is why the same `HabitStatsView` produced by a use case renders as an iOS list, a Material list
or a Fluent card without any of them duplicating a rule. The kit receives the view models through
`KitApiProvider` — the same constructor injection Flutter apps do with `Provider` — and never imports
application code.

## Directory

```
src/
  main.tsx                       entry: providers + service worker
  app/                           composition root
    services.tsx                 services → repositories → view models
    App.tsx                      injects the view models into the kit
  core/change_notifier.ts        observable primitive
  utils/dates.ts                 local date keys
  domain/                        entities, rules, read models
    models/{habit,result}.ts
    use_cases/habits.ts
  data/                          data access
    services/{local_storage,clock,device,install,celebration}_service.ts
    models/habit_dto.ts
    repositories/{habits,design_language,install}_repository.ts
  ui/                            view models (views live in the kit)
    today/view_models/today_view_model.ts
    stats/view_models/stats_view_model.ts
    settings/view_models/settings_view_model.ts
    install/view_models/install_view_model.ts
    core/widgets/confetti_canvas.tsx
packages/ui-kit/                 design system + views for six languages
```

## Tests per layer

| Layer | What the tests cover |
|---|---|
| `utils/__tests__` | date keys across month, year and DST boundaries (`TZ=America/New_York`) |
| `domain/use_cases/__tests__` | every rule: validation, future dates, sorted completions, streaks, seven-day summaries |
| `data/__tests__`, `data/services/__tests__` | envelope validation, persistence round-trips, first-run seeding, throwing storage, clock rollover, UA detection, per-browser install steps |
| `ui/**/view_models/__tests__` | the whole chain without React: command → use case → repository → store → view-model state |
| `packages/ui-kit/src/__tests__` | the design-language registry and resolution rules |

View models are deliberately thin: they hold no rule that is not already covered above, which is the
point of keeping the logic in use cases.

/**
 * Root — the adaptive switcher. Resolves the design language from the injected
 * platform info and lazily loads exactly one implementation:
 *
 *   cupertino ▸ Framework7 (ios theme)   material ▸ Framework7 (md theme)
 *   fluent    ▸ Fluent UI v9             yaru / custom / shadcn ▸ code kit
 *
 * The two Framework7 entries are separate modules so each ships only the icon
 * font its theme uses.
 */
import { lazy, Suspense } from 'react';
import { usePlatform } from './context.js';
import { DEFAULT_DESIGN } from './designSystems.js';
import Splash from './Splash.jsx';

const IMPLS = {
  cupertino: lazy(() => import('./kits/framework7/cupertino.jsx')),
  material: lazy(() => import('./kits/framework7/material.jsx')),
  fluent: lazy(() => import('./kits/fluent/Root.jsx')),
  custom: lazy(() => import('./kits/code/Root.jsx')),
  shadcn: lazy(() => import('./kits/code/Root.jsx')),
  yaru: lazy(() => import('./kits/code/Root.jsx')),
};

export default function Root() {
  const { designSystem } = usePlatform();
  const Impl = IMPLS[designSystem] ?? IMPLS[DEFAULT_DESIGN];
  return (
    <Suspense fallback={<Splash />}>
      <Impl />
    </Suspense>
  );
}

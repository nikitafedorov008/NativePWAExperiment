/**
 * Adaptive switcher: resolves the design system from PlatformContext and lazy
 * loads exactly one UI implementation. Chunks are split per kit, so a browser
 * tab never downloads Framework7 and an installed Android user never downloads
 * Fluent code. Splash covers the chunk load.
 */
import { lazy, Suspense } from 'react';
import { createAdaptive } from '../platform/adaptive.jsx';
import Splash from './Splash.jsx';

const Root = createAdaptive({
  web: lazy(() => import('../ui/web/Root.jsx')),
  cupertino: lazy(() => import('../ui/cupertino/Root.jsx')),
  material: lazy(() => import('../ui/material/Root.jsx')),
  fluent: lazy(() => import('../ui/fluent/Root.jsx')),
});

export default function App() {
  return (
    <Suspense fallback={<Splash />}>
      <Root />
    </Suspense>
  );
}

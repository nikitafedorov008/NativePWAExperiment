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

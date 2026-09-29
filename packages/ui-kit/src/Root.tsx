/**
 * Root — the adaptive switcher. Resolves the design language from the injected
 * platform info and lazily loads exactly one implementation:
 *
 *   cupertino ▸ Framework7 (ios theme)   material ▸ Framework7 (md theme)
 *   fluent    ▸ Fluent UI v9             yaru / custom / shadcn ▸ code kit
 *
 * The two Framework7 entries are separate modules so each ships only the icon
 * font its language uses.
 */
import { lazy, Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { useAppearance } from './context.ts';
import { DEFAULT_DESIGN, isDesignSystem } from './designSystems.ts';
import Splash from './Splash.tsx';
import type { DesignSystem } from './types.ts';

const IMPLS: Record<DesignSystem, LazyExoticComponent<ComponentType>> = {
  cupertino: lazy(() => import('./kits/framework7/cupertino.tsx')),
  material: lazy(() => import('./kits/framework7/material.tsx')),
  fluent: lazy(() => import('./kits/fluent/Root.tsx')),
  custom: lazy(() => import('./kits/code/Root.tsx')),
  shadcn: lazy(() => import('./kits/code/Root.tsx')),
  yaru: lazy(() => import('./kits/code/Root.tsx')),
};

export default function Root() {
  const { designSystem } = useAppearance();
  const Impl = isDesignSystem(designSystem) ? IMPLS[designSystem] : IMPLS[DEFAULT_DESIGN];
  return (
    <Suspense fallback={<Splash />}>
      <Impl />
    </Suspense>
  );
}

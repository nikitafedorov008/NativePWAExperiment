import { usePlatform } from './PlatformContext.jsx';

export function createAdaptive(impls) {
  function AdaptiveComponent(props) {
    const { designSystem } = usePlatform();
    const Impl = impls[designSystem] ?? impls.web;
    return Impl ? <Impl {...props} /> : null;
  }
  AdaptiveComponent.displayName = `Adaptive(${Object.keys(impls).join('|')})`;
  return AdaptiveComponent;
}

export function Adaptive({ web, cupertino, material, fluent }) {
  const { designSystem } = usePlatform();
  const nodes = { web, cupertino, material, fluent };
  return nodes[designSystem] ?? web ?? null;
}

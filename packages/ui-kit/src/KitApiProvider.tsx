import { KitApiContext } from './context.ts';
import type { KitApiProviderProps } from './types.ts';

/**
 * Injects the host app's API (habits, install flow, platform info, domain
 * constants) into the kit. The app renders this once, around <Root />.
 */
export function KitApiProvider({ api, children }: KitApiProviderProps) {
  return <KitApiContext.Provider value={api}>{children}</KitApiContext.Provider>;
}

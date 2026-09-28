import { KitApiContext } from './context.js';

/**
 * Injects the host app's API (habits, install flow, platform info, domain
 * constants) into the kit. The app renders this once, around <Root />.
 */
export function KitApiProvider({ api, children }) {
  return <KitApiContext.Provider value={api}>{children}</KitApiContext.Provider>;
}

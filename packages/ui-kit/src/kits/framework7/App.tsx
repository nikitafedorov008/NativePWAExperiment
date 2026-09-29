/**
 * Shared Framework7 shell for the Cupertino and Material design languages.
 * Framework7 renders one component tree in either native language depending on
 * the `theme` prop — the design languages' own names map to F7's theme ids in
 * ./cupertino.tsx and ./material.tsx, so nothing else in the app sees them.
 * Views read zustand stores; the shell itself only owns which tab is open.
 */
import { useState } from 'react';
import { useStore } from 'zustand';
import { App, Fab, Icon, Link, Navbar, NavRight, Page, Toolbar, View } from 'framework7-react';
import { injectAppStyles } from '../../appStyles.ts';
import { useTodayViewModel } from '../../context.ts';
import HabitFormPopup from './screens/HabitFormPopup.tsx';
import SettingsScreen from './screens/Settings.tsx';
import StatsScreen from './screens/Stats.tsx';
import TodayScreen from './screens/Today.tsx';

injectAppStyles();

/** Framework7's own theme ids — the adapter layer's currency. */
export type Framework7Theme = 'ios' | 'md';

interface Tab {
  id: string;
  title: string;
  iconIos: string;
  iconMaterial: string;
}

const TABS: Tab[] = [
  { id: 'today', title: 'Today', iconIos: 'f7:checkmark_seal_fill', iconMaterial: 'today' },
  { id: 'stats', title: 'Stats', iconIos: 'f7:chart_bar_fill', iconMaterial: 'bar_chart' },
  { id: 'settings', title: 'Settings', iconIos: 'f7:gear_alt_fill', iconMaterial: 'settings' },
];

export default function F7Root({ theme }: { theme: Framework7Theme }) {
  const today = useTodayViewModel();
  const { todayLabel } = useStore(today);
  const openEditor = useStore(today, (state) => state.openEditor);
  const [screen, setScreen] = useState('today');

  return (
    <App theme={theme} darkMode="auto" colors={{ primary: '#0057ff' }} name="Streaks">
      <View main>
        <Page>
          <Navbar
            title={TABS.find((tab) => tab.id === screen)?.title ?? 'Streaks'}
            subtitle={screen === 'today' ? todayLabel : undefined}
          >
            {screen === 'today' && (
              <NavRight>
                <Link
                  iconIos="f7:plus"
                  iconMaterial="add"
                  aria-label="Add habit"
                  onClick={() => openEditor(null)}
                />
              </NavRight>
            )}
          </Navbar>

          {screen === 'today' && <TodayScreen />}
          {screen === 'stats' && <StatsScreen />}
          {screen === 'settings' && <SettingsScreen />}

          <Toolbar bottom tabbar icons>
            {TABS.map(({ id, title, iconIos, iconMaterial }) => (
              <Link
                key={id}
                className="tab-link"
                iconIos={iconIos}
                iconMaterial={iconMaterial}
                text={title}
                tabLinkActive={screen === id}
                onClick={() => setScreen(id)}
              />
            ))}
          </Toolbar>

          {theme === 'md' && screen === 'today' && (
            <Fab position="right-bottom" onClick={() => openEditor(null)}>
              <Icon ios="f7:plus" md="material:add" />
            </Fab>
          )}
        </Page>
      </View>

      <HabitFormPopup />
    </App>
  );
}

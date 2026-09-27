import { useCallback, useState } from 'react';
import {
  App,
  Fab,
  Icon,
  Link,
  Navbar,
  NavRight,
  Page,
  Toolbar,
  View,
} from 'framework7-react';
import { useHabits } from '@/domain/habits/HabitsContext.jsx';
import HabitFormPopup from './screens/HabitFormPopup.jsx';
import TodayScreen from './screens/Today.jsx';
import StatsScreen from './screens/Stats.jsx';
import SettingsScreen from './screens/Settings.jsx';
import './habits.css';

const TABS = [
  { id: 'today', title: 'Today', iconIos: 'f7:checkmark_seal_fill', iconMaterial: 'today' },
  { id: 'stats', title: 'Stats', iconIos: 'f7:chart_bar_fill', iconMaterial: 'bar_chart' },
  { id: 'settings', title: 'Settings', iconIos: 'f7:gear_alt_fill', iconMaterial: 'settings' },
];

export default function F7Root({ theme }) {
  const { todayLabel } = useHabits();
  const [screen, setScreen] = useState('today');
  const [editor, setEditor] = useState({ open: false, habit: null });
  const openEditor = useCallback((habit = null) => setEditor({ open: true, habit }), []);
  const closeEditor = useCallback(() => setEditor((prev) => ({ ...prev, open: false })), []);

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
                  onClick={() => openEditor()}
                />
              </NavRight>
            )}
          </Navbar>

          {screen === 'today' && <TodayScreen onOpenEditor={openEditor} />}
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
            <Fab position="right-bottom" onClick={() => openEditor()}>
              <Icon ios="f7:plus" md="material:add" />
            </Fab>
          )}
        </Page>
      </View>

      <HabitFormPopup open={editor.open} habit={editor.habit} onClose={closeEditor} />
    </App>
  );
}

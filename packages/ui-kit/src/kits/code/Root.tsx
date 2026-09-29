/**
 * Code kit — custom / shadcn / yaru are drawn by the same widgets; the design
 * language only changes tokens and behavior inside theme.tsx. The shell is a
 * dumb view: navigation state is local, everything else comes from view models.
 */
import { useState } from 'react';
import { CalendarCheck, ChartColumn, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useTodayViewModel } from '../../context.ts';
import { useObservable } from '../../hooks.ts';
import { ThemeProvider, useTheme } from '../../theme.tsx';
import { AppBar, Fab, NavigationBar, Scaffold } from '../../widgets.tsx';
import type { NavItem } from '../../widgets.tsx';
import HabitFormDialog from './components/HabitFormDialog.tsx';
import Settings from './screens/Settings.tsx';
import Stats from './screens/Stats.tsx';
import Today from './screens/Today.tsx';

const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'stats', label: 'Stats', icon: ChartColumn },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const TITLES: Record<string, string> = { today: 'Today', stats: 'Stats', settings: 'Settings' };

function Shell() {
  const t = useTheme();
  const today = useTodayViewModel();
  const { todayLabel } = useObservable(today);
  const [screen, setScreen] = useState('today');

  const openAdd = (): void => today.openEditor(null);

  return (
    <>
      <Scaffold
        appBar={
          <AppBar
            title={TITLES[screen] ?? 'Streaks'}
            subtitle={screen === 'today' ? todayLabel : undefined}
            actions={
              screen === 'today' && !t.behavior.fab ? (
                <button
                  type="button" className="pressable" aria-label="Add habit" onClick={openAdd}
                  style={{
                    width: 38, height: 38, borderRadius: 999, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: t.color.brand,
                  }}
                >
                  <Plus size={22} />
                </button>
              ) : null
            }
          />
        }
        bottomBar={<NavigationBar items={NAV_ITEMS} active={screen} onChange={setScreen} />}
        fab={t.behavior.fab && screen === 'today' ? <Fab icon={Plus} label="Add habit" onClick={openAdd} /> : null}
      >
        {screen === 'today' && <Today />}
        {screen === 'stats' && <Stats />}
        {screen === 'settings' && <Settings />}
      </Scaffold>

      <HabitFormDialog />
    </>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}

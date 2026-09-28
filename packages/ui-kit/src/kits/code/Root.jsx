/**
 * Code kit — custom / shadcn / yaru are drawn by the same widgets; the design
 * language only changes tokens and behavior inside theme.jsx.
 */
import { useState } from 'react';
import { CalendarCheck, ChartColumn, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useHabits } from '../../context.js';
import { ThemeProvider, useTheme } from '../../theme.jsx';
import { AppBar, Fab, NavigationBar, Scaffold } from '../../widgets.jsx';
import HabitFormDialog from './components/HabitFormDialog.jsx';
import Stats from './screens/Stats.jsx';
import Settings from './screens/Settings.jsx';
import Today from './screens/Today.jsx';

const NAV_ITEMS = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'stats', label: 'Stats', icon: ChartColumn },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const TITLES = { today: 'Today', stats: 'Stats', settings: 'Settings' };

function Shell() {
  const t = useTheme();
  const { todayLabel } = useHabits();
  const [screen, setScreen] = useState('today');
  const [editor, setEditor] = useState(null);

  const openAdd = () => setEditor({ habit: null });

  return (
    <>
      <Scaffold
        appBar={
          <AppBar
            title={TITLES[screen]}
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
        {screen === 'today' && <Today onOpenEditor={setEditor} />}
        {screen === 'stats' && <Stats />}
        {screen === 'settings' && <Settings />}
      </Scaffold>

      <HabitFormDialog
        open={editor !== null}
        habit={editor?.habit ?? null}
        onClose={() => setEditor(null)}
      />
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

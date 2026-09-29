/**
 * Code kit — custom / shadcn / yaru are drawn by the same widgets; the design
 * language only changes tokens and behavior inside theme.tsx.
 */
import { useState } from 'react';
import { CalendarCheck, ChartColumn, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useHabits } from '../../context.ts';
import { ThemeProvider, useTheme } from '../../theme.tsx';
import { AppBar, Fab, NavigationBar, Scaffold } from '../../widgets.tsx';
import type { NavItem } from '../../widgets.tsx';
import type { Habit } from '../../types.ts';
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

/** Editor state shared by the screens: which habit (or none = create) is open. */
export interface EditorState {
  habit: Habit | null;
}

function Shell() {
  const t = useTheme();
  const { todayLabel } = useHabits();
  const [screen, setScreen] = useState('today');
  const [editor, setEditor] = useState<EditorState | null>(null);

  const openAdd = (): void => setEditor({ habit: null });

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

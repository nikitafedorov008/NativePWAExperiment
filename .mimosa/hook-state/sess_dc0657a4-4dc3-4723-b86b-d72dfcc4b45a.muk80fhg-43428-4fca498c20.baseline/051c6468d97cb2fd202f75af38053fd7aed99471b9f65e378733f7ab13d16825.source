import './styles.css';
import { useEffect, useState } from 'react';
import { Download, Flame } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext.jsx';
import { useInstallPrompt } from '@/platform/useInstallPrompt.js';
import { Button } from '@/ui/web/components/ui/button';
import { cn } from '@/ui/web/lib/utils';
import InstallBanner from './InstallBanner.jsx';
import { NAV_ITEMS } from './nav.js';
import Settings from './screens/Settings.jsx';
import Stats from './screens/Stats.jsx';
import Today from './screens/Today.jsx';

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2 font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[#0057ff] text-white">
        <Flame className="size-4.5" aria-hidden="true" />
      </span>
      Streaks
    </div>
  );
}

function Sidebar({ screen, onNavigate, showInstall, onInstall }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r bg-sidebar px-3 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 text-sidebar-foreground md:flex">
      <Brand />
      <nav aria-label="Primary" className="grid gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = id === screen;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>
      {showInstall && (
        <Button variant="outline" className="mt-auto" onClick={onInstall}>
          <Download />
          Install
        </Button>
      )}
    </aside>
  );
}

function TabBar({ screen, onNavigate }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = id === screen;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

const SCREENS = { today: Today, stats: Stats, settings: Settings };

export default function Root() {
  const { prefersDark } = usePlatform();
  const { installed, dismissed, undismiss } = useInstallPrompt();
  const [screen, setScreen] = useState('today');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', prefersDark);
  }, [prefersDark]);

  const requestInstall = () => {
    undismiss();
    setScreen('today');
    window.scrollTo({ top: 0 });
  };

  const Screen = SCREENS[screen];
  const showBanner = !installed && !dismissed;

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar screen={screen} onNavigate={setScreen} showInstall={!installed} onInstall={requestInstall} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
          <div className="flex h-14 items-center px-2">
            <Brand />
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-8 md:py-8">
          <div className="grid gap-6">
            {showBanner && <InstallBanner />}
            <Screen onInstall={requestInstall} />
          </div>
        </main>
        <TabBar screen={screen} onNavigate={setScreen} />
      </div>
    </div>
  );
}

/**
 * Fluent design language (Windows) — built on @fluentui/react-components v9.
 * Fluent styles itself with CSS-in-JS design tokens, so light/dark follows
 * `prefersDark` with no extra stylesheet; kit-specific widgets are covered by
 * the shared appStyles.ts injector.
 */
import { useState } from 'react';
import {
  FluentProvider,
  Tab,
  TabList,
  Text,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { CalendarCheckmarkRegular, DataUsageRegular, SettingsRegular } from '@fluentui/react-icons';
import { injectAppStyles } from '../../appStyles.ts';
import { usePlatform } from '../../context.ts';
import SettingsScreen from './screens/Settings.tsx';
import StatsScreen from './screens/Stats.tsx';
import TodayScreen from './screens/Today.tsx';

injectAppStyles();

export default function Root() {
  const { prefersDark } = usePlatform();
  const [screen, setScreen] = useState<string>('today');

  return (
    <FluentProvider theme={prefersDark ? webDarkTheme : webLightTheme}>
      <div className="fluent-app">
        <header className="fluent-topbar">
          <Text size={400} weight="semibold">🔥 Streaks</Text>
          <TabList
            appearance="transparent"
            selectedValue={screen}
            onTabSelect={(_event: SelectTabEvent, data: SelectTabData) => setScreen(String(data.value))}
          >
            <Tab value="today" icon={<CalendarCheckmarkRegular />}>Today</Tab>
            <Tab value="stats" icon={<DataUsageRegular />}>Stats</Tab>
            <Tab value="settings" icon={<SettingsRegular />}>Settings</Tab>
          </TabList>
        </header>
        <main className="fluent-main">
          {screen === 'today' && <TodayScreen />}
          {screen === 'stats' && <StatsScreen />}
          {screen === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </FluentProvider>
  );
}

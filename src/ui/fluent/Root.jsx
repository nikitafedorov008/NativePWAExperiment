/**
 * Fluent look (Windows): built on @fluentui/react-components v9. Fluent's
 * styling is CSS-in-JS driven by design tokens, so light/dark follows
 * prefersDark and needs no separate stylesheet; custom widget styles come
 * from the shared appStyles.js injector.
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
import { CalendarCheckmarkRegular, DataUsageRegular, SettingsRegular } from '@fluentui/react-icons';
import { usePlatform } from '@/platform/PlatformContext.jsx';
import { injectAppStyles } from '../appStyles.js';
import TodayScreen from './screens/Today.jsx';
import StatsScreen from './screens/Stats.jsx';
import SettingsScreen from './screens/Settings.jsx';

injectAppStyles();

export default function Root() {
  const { prefersDark } = usePlatform();
  const [screen, setScreen] = useState('today');

  return (
    <FluentProvider theme={prefersDark ? webDarkTheme : webLightTheme}>
      <div className="fluent-app">
        <header className="fluent-topbar">
          <Text size={400} weight="semibold">🔥 Streaks</Text>
          <TabList
            appearance="transparent"
            selectedValue={screen}
            onTabSelect={(_, data) => setScreen(data.value)}
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

import { Card, Text, Title2 } from '@fluentui/react-components';
import { useStatsViewModel } from '../../../context.ts';
import { useObservable } from '../../../hooks.ts';
import WeekDots from '../components/WeekDots.tsx';

export default function StatsScreen() {
  const { tiles, items } = useObservable(useStatsViewModel());

  return (
    <section className="fluent-screen">
      <Title2>Stats</Title2>

      <div className="tiles-grid">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <Text size={300}>{tile.label}</Text>
            <Text size={500} weight="semibold" className="tile-value">{tile.value}</Text>
          </Card>
        ))}
      </div>

      <Card>
        <Text weight="semibold">Habits</Text>
        <Text size={300}>Streaks and the last 7 days</Text>
        {items.length === 0 ? (
          <Text size={300}>No habits yet.</Text>
        ) : (
          <ul className="habit-list">
            {items.map((item) => (
              <li key={item.id} className="habit-row">
                <div className="habit-row-main">
                  <span className="habit-emoji" aria-hidden="true">{item.emoji}</span>
                  <span className="habit-name" style={{ cursor: 'default' }}>{item.name}</span>
                  <Text size={300} className="habit-sub">{item.summary}</Text>
                </div>
                <WeekDots days={item.days} className="habit-week-dots" />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

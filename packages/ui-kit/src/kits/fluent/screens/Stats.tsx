import { Card, Text, Title2 } from '@fluentui/react-components';
import { useHabits } from '../../../context.ts';
import type { BestStreakHabit } from '../../../types.ts';
import WeekDots from '../components/WeekDots.tsx';

const bestStreakLabel = (best: BestStreakHabit | null): string =>
  best ? `${best.emoji} ${best.name} · ${best.bestStreak} days` : '—';

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <Text size={300}>{label}</Text>
      <Text size={500} weight="semibold" className="tile-value">{value}</Text>
    </Card>
  );
}

export default function StatsScreen() {
  const { habits, overall, statsFor } = useHabits();

  const tiles: { label: string; value: string | number }[] = [
    { label: 'Total completions', value: overall.totalCompletions },
    { label: 'Best streak', value: bestStreakLabel(overall.bestStreakHabit) },
    { label: 'Perfect days (7d)', value: overall.perfectDays7 },
    { label: 'Completion rate (7d)', value: `${Math.round(overall.completionRate7 * 100)}%` },
  ];

  return (
    <section className="fluent-screen">
      <Title2>Stats</Title2>

      <div className="tiles-grid">
        {tiles.map((tile) => (
          <Tile key={tile.label} label={tile.label} value={tile.value} />
        ))}
      </div>

      <Card>
        <Text weight="semibold">Habits</Text>
        <Text size={300}>Streaks and the last 7 days</Text>
        {habits.length === 0 ? (
          <Text size={300}>No habits yet.</Text>
        ) : (
          <ul className="habit-list">
            {habits.map((habit) => {
              const stats = statsFor(habit.id);
              if (!stats) return null;
              return (
                <li key={habit.id} className="habit-row">
                  <div className="habit-row-main">
                    <span className="habit-emoji" aria-hidden="true">{habit.emoji}</span>
                    <span className="habit-name" style={{ cursor: 'default' }}>{habit.name}</span>
                    <Text size={300} className="habit-sub">
                      🔥 {stats.currentStreak} current · {stats.bestStreak} best · {stats.doneCount} done
                    </Text>
                  </div>
                  <WeekDots days={stats.weekStrip} className="habit-week-dots" />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}

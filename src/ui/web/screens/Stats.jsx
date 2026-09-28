import { useHabits } from '@/domain/habits/HabitsContext.jsx';
import WeekDots from '../components/WeekDots.jsx';
import { useTheme } from '../theme.jsx';
import { Card, Text } from '../widgets.jsx';

const bestStreakLabel = (best) => (best ? `${best.emoji} ${best.name} · ${best.bestStreak} days` : '—');

function StatTile({ label, value }) {
  return (
    <Card style={{ gap: 3, padding: 14 }}>
      <Text variant="caption">{label}</Text>
      <Text variant="headline" style={{ fontSize: 19, fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </Text>
    </Card>
  );
}

export default function Stats() {
  const t = useTheme();
  const { habits, overall, statsFor } = useHabits();

  const tiles = [
    { label: 'Total completions', value: overall.totalCompletions },
    { label: 'Best streak', value: bestStreakLabel(overall.bestStreakHabit) },
    { label: 'Perfect days (7d)', value: overall.perfectDays7 },
    { label: 'Completion rate (7d)', value: `${Math.round(overall.completionRate7 * 100)}%` },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {tiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} value={tile.value} />
        ))}
      </div>

      <Card style={{ padding: '4px 16px' }}>
        <div style={{ padding: '12px 4px 4px' }}>
          <Text variant="headline">Habits</Text>
          <Text variant="caption" style={{ display: 'block' }}>Streaks and the last 7 days</Text>
        </div>
        {habits.length === 0 ? (
          <Text variant="body" style={{ textAlign: 'center', padding: '20px 0', opacity: 0.55 }}>No habits yet.</Text>
        ) : (
          habits.map((habit, index) => {
            const stats = statsFor(habit.id);
            if (!stats) return null;
            return (
              <div key={habit.id} style={{ padding: '12px 4px' }}>
                {index > 0 && <div style={{ height: 1, background: t.color.divider, marginBottom: 12 }} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>{habit.emoji}</span>
                    <Text variant="body" style={{ fontWeight: 550, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {habit.name}
                    </Text>
                  </div>
                  <div style={{ paddingLeft: 34 }}>
                    <Text variant="caption" style={{ display: 'block', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
                      🔥 {stats.currentStreak} current · {stats.bestStreak} best · {stats.doneCount} done
                    </Text>
                    <WeekDots days={stats.weekStrip} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </>
  );
}

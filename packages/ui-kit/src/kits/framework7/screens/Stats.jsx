import { Block, BlockTitle, List, ListItem } from 'framework7-react';
import { useHabits } from '../../../context.js';
import WeekDots from '../components/WeekDots.jsx';

const bestStreakLabel = (best) => (best ? `${best.emoji} ${best.name} · ${best.bestStreak} days` : '—');

export default function StatsScreen() {
  const { habits, overall, statsFor } = useHabits();

  const tiles = [
    { label: 'Total completions', value: overall.totalCompletions },
    { label: 'Best streak', value: bestStreakLabel(overall.bestStreakHabit) },
    { label: 'Perfect days (7d)', value: overall.perfectDays7 },
    { label: 'Completion rate (7d)', value: `${Math.round(overall.completionRate7 * 100)}%` },
  ];

  return (
    <>
      <div className="stats-grid">
        {tiles.map((tile) => (
          <div key={tile.label} className="stat-tile">
            <div className="stat-value">{tile.value}</div>
            <div className="stat-label">{tile.label}</div>
          </div>
        ))}
      </div>

      <BlockTitle>Habits</BlockTitle>
      {habits.length === 0 ? (
        <Block strong className="empty-hint">No habits yet.</Block>
      ) : (
        <List strong inset>
          {habits.map((habit) => {
            const stats = statsFor(habit.id);
            if (!stats) return null;
            return (
              <ListItem key={habit.id}>
                <span slot="media" className="habit-emoji-lg" aria-hidden="true">{habit.emoji}</span>
                <span slot="title">{habit.name}</span>
                <div slot="inner" className="habit-week-wrap">
                  <span className="habit-sub">
                    🔥 {stats.currentStreak} current · {stats.bestStreak} best · {stats.doneCount} done
                  </span>
                  <WeekDots days={stats.weekStrip} />
                </div>
              </ListItem>
            );
          })}
        </List>
      )}
    </>
  );
}

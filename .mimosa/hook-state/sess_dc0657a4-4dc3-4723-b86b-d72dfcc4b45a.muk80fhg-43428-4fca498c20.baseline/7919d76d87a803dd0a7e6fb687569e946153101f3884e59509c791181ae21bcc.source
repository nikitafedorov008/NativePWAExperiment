import { useHabits } from '@/domain/habits/HabitsContext.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/web/components/ui/card';
import WeekStrip from '../components/WeekStrip.jsx';

function Tile({ label, value }) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader className="px-5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="truncate text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

const bestStreakLabel = (best) => (best ? `${best.emoji} ${best.name} · ${best.bestStreak} days` : '—');

export default function Stats() {
  const { habits, overall, statsFor } = useHabits();
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Total completions" value={overall.totalCompletions} />
        <Tile label="Best streak" value={bestStreakLabel(overall.bestStreakHabit)} />
        <Tile label="Perfect days (7d)" value={overall.perfectDays7} />
        <Tile label="Completion rate (7d)" value={`${Math.round(overall.completionRate7 * 100)}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Habits</CardTitle>
          <CardDescription>Streaks and the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No habits yet.</p>
          ) : (
            <ul className="divide-y">
              {habits.map((habit) => {
                const stats = statsFor(habit.id);
                if (!stats) return null;
                return (
                  <li key={habit.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none" aria-hidden="true">
                        {habit.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{habit.name}</p>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          🔥 {stats.currentStreak} current · {stats.bestStreak} best · {stats.doneCount} done
                        </p>
                      </div>
                    </div>
                    <WeekStrip days={stats.weekStrip} className="pl-9" />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

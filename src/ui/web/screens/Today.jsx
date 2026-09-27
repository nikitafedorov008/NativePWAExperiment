import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useHabits } from '@/domain/habits/HabitsContext.jsx';
import { Button } from '@/ui/web/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/web/components/ui/card';
import { Progress } from '@/ui/web/components/ui/progress';
import HabitDialog from '../components/HabitDialog.jsx';
import HabitRow from '../components/HabitRow.jsx';

export default function Today() {
  const { habits, todayLabel, progress, addHabit, renameHabit, removeHabit, toggle, toggleToday, statsFor } =
    useHabits();
  const [editor, setEditor] = useState(null);

  const openAdd = () => setEditor({ habit: null });
  const closeEditor = () => setEditor(null);

  const handleSubmit = (values) => {
    const ok = editor.habit ? renameHabit(editor.habit.id, values) : addHabit(values);
    if (ok) closeEditor();
  };

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">Today</p>
          <h1 className="text-2xl font-semibold tracking-tight">{todayLabel}</h1>
        </div>
        <Button onClick={openAdd}>
          <Plus />
          Add habit
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardDescription>Progress</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {progress.done}
            <span className="text-lg font-normal text-muted-foreground"> / {progress.total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={Math.round(progress.ratio * 100)} aria-label="Today's progress" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {habits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No habits yet. Add your first one.</p>
          ) : (
            <ul className="divide-y">
              {habits.map((habit) => {
                const stats = statsFor(habit.id);
                if (!stats) return null;
                return (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    stats={stats}
                    onToggleToday={() => toggleToday(habit.id)}
                    onToggleDay={(date) => toggle(habit.id, date)}
                    onRename={() => setEditor({ habit })}
                    onRemove={() => removeHabit(habit.id)}
                  />
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <HabitDialog
        open={editor !== null}
        onOpenChange={(open) => !open && closeEditor()}
        habit={editor?.habit ?? null}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

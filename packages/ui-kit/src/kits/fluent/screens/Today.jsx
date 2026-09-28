import { useState } from 'react';
import {
  Badge,
  Button,
  Caption1,
  Card,
  Checkbox,
  ProgressBar,
  Text,
  Title2,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { useHabits } from '../../../context.js';
import HabitFormDialog from '../components/HabitFormDialog.jsx';
import WeekDots from '../components/WeekDots.jsx';

export default function TodayScreen() {
  const { habits, todayLabel, progress, toggle, toggleToday, statsFor, removeHabit } = useHabits();
  const [editor, setEditor] = useState(null);

  return (
    <section className="fluent-screen">
      <header className="fluent-screen-header">
        <div>
          <Caption1 block>Today</Caption1>
          <Title2>{todayLabel}</Title2>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={() => setEditor({ habit: null })}>
          Add habit
        </Button>
      </header>

      <Card>
        <div className="habit-row-main" style={{ justifyContent: 'space-between' }}>
          <Text size={300}>Progress</Text>
          <Text size={400} weight="semibold" className="tile-value">
            {progress.done} <Text size={300} weight="regular">/ {progress.total}</Text>
          </Text>
        </div>
        <ProgressBar value={progress.ratio} thickness="large" aria-label="Today's progress" />
      </Card>

      <Card>
        {habits.length === 0 ? (
          <Text size={300}>No habits yet. Add your first one.</Text>
        ) : (
          <ul className="habit-list">
            {habits.map((habit) => {
              const stats = statsFor(habit.id);
              if (!stats) return null;
              const doneToday = stats.weekStrip.some((day) => day.isToday && day.done);
              return (
                <li key={habit.id} className="habit-row">
                  <div className="habit-row-main">
                    <Checkbox
                      checked={doneToday}
                      onChange={() => toggleToday(habit.id)}
                      aria-label={`${habit.name}: done today`}
                    />
                    <span className="habit-emoji" aria-hidden="true">{habit.emoji}</span>
                    <button
                      type="button"
                      className="habit-name"
                      aria-label={`Rename ${habit.name}`}
                      onClick={() => setEditor({ habit })}
                    >
                      {habit.name}
                    </button>
                    {stats.currentStreak > 0 && (
                      <Badge appearance="filled" color="brand" aria-label={`${stats.currentStreak} day streak`}>
                        🔥 {stats.currentStreak}
                      </Badge>
                    )}
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<EditRegular />}
                      aria-label={`Rename ${habit.name}`}
                      onClick={() => setEditor({ habit })}
                    />
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<DeleteRegular />}
                      aria-label={`Delete ${habit.name}`}
                      onClick={() => removeHabit(habit.id)}
                    />
                  </div>
                  <WeekDots
                    days={stats.weekStrip}
                    onToggle={(date) => toggle(habit.id, date)}
                    className="habit-week-dots"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <HabitFormDialog
        open={editor !== null}
        habit={editor?.habit ?? null}
        onClose={() => setEditor(null)}
      />
    </section>
  );
}

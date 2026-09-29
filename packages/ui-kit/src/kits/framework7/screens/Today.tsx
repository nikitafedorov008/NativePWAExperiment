import {
  Badge,
  Block,
  Icon,
  Link,
  List,
  ListItem,
  Progressbar,
  SwipeoutActions,
  SwipeoutButton,
} from 'framework7-react';
import { useHabits } from '../../../context.ts';
import type { Habit } from '../../../types.ts';
import WeekDots from '../components/WeekDots.tsx';

export interface TodayScreenProps {
  onOpenEditor(habit: Habit | null): void;
}

export default function TodayScreen({ onOpenEditor }: TodayScreenProps) {
  const { habits, progress, toggle, toggleToday, statsFor, removeHabit } = useHabits();

  return (
    <>
      <Block strong className="today-progress">
        <div className="today-progress-row">
          <span className="today-progress-num">
            {progress.done}
            <span className="muted"> / {progress.total}</span>
          </span>
          <span className="today-progress-label">done today</span>
        </div>
        <Progressbar progress={Math.round(progress.ratio * 100)} aria-label="Today's progress" />
      </Block>

      {habits.length === 0 ? (
        <Block strong className="empty-hint">No habits yet. Add your first one.</Block>
      ) : (
        <List strong inset>
          {habits.map((habit) => {
            const stats = statsFor(habit.id);
            if (!stats) return null;
            const doneToday = stats.weekStrip.some((day) => day.isToday && day.done);
            return (
              <ListItem key={habit.id} swipeout className="habit-item">
                <button
                  slot="media"
                  type="button"
                  aria-label={`${habit.name}: done today`}
                  aria-pressed={doneToday}
                  className={`habit-check${doneToday ? ' done' : ''}`}
                  onClick={() => toggleToday(habit.id)}
                >
                  <Icon ios="f7:checkmark" md="material:check" />
                </button>
                <button
                  slot="title"
                  type="button"
                  className="habit-name"
                  aria-label={`Rename ${habit.name}`}
                  onClick={() => onOpenEditor(habit)}
                >
                  <span className="habit-emoji" aria-hidden="true">{habit.emoji}</span>
                  <span className="habit-name-text">{habit.name}</span>
                </button>
                <span slot="after" className="habit-after">
                  {stats.currentStreak > 0 && <Badge>🔥 {stats.currentStreak}</Badge>}
                  <Link
                    className="habit-icon-btn"
                    iconIos="f7:pencil"
                    iconMaterial="edit"
                    aria-label={`Rename ${habit.name}`}
                    onClick={() => onOpenEditor(habit)}
                  />
                  <Link
                    className="habit-icon-btn danger"
                    iconIos="f7:trash"
                    iconMaterial="delete"
                    aria-label={`Delete ${habit.name}`}
                    onClick={() => removeHabit(habit.id)}
                  />
                </span>
                <div slot="inner" className="habit-week">
                  <WeekDots days={stats.weekStrip} onToggle={(date) => toggle(habit.id, date)} />
                </div>
                <SwipeoutActions right>
                  <SwipeoutButton delete onClick={() => removeHabit(habit.id)}>
                    <Icon ios="f7:trash" md="material:delete" /> Delete
                  </SwipeoutButton>
                </SwipeoutActions>
              </ListItem>
            );
          })}
        </List>
      )}
    </>
  );
}

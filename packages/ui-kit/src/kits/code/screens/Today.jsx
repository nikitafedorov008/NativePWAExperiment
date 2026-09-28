import { Pencil, Trash2 } from 'lucide-react';
import { useHabits, useInstall } from '../../../context.js';
import { useTheme } from '../../../theme.jsx';
import { Badge, Card, Checkbox, Divider, IconButton, ProgressBar, Text } from '../../../widgets.jsx';
import InstallBanner from '../components/InstallBanner.jsx';
import WeekDots from '../components/WeekDots.jsx';

function HabitTile({ habit, stats, onToggleDay, onToggleToday, onRename, onRemove }) {
  const doneToday = stats.weekStrip.some((day) => day.isToday && day.done);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Checkbox checked={doneToday} onChange={onToggleToday} label={`${habit.name}: done today`} />
        <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>{habit.emoji}</span>
        <button
          type="button" className="pressable"
          aria-label={`Rename ${habit.name}`} onClick={onRename}
          style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left', borderRadius: 6, padding: '2px 0' }}
        >
          <Text variant="body" style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {habit.name}
          </Text>
          <Pencil size={12} style={{ opacity: 0.55, flexShrink: 0 }} aria-hidden="true" />
        </button>
        {stats.currentStreak > 0 && <Badge>🔥 {stats.currentStreak}</Badge>}
        <IconButton icon={Trash2} label={`Delete ${habit.name}`} onClick={onRemove} />
      </div>
      <WeekDots days={stats.weekStrip} onToggle={onToggleDay} />
    </div>
  );
}

export default function Today({ onOpenEditor }) {
  const t = useTheme();
  const { habits, progress, removeHabit, toggle, toggleToday, statsFor } = useHabits();
  const { installed, dismissed } = useInstall();

  return (
    <>
      {!installed && !dismissed && <InstallBanner />}

      <Card style={{ gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text variant="caption">Progress</Text>
          <Text variant="title" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {progress.done}
            <span style={{ opacity: 0.55, fontSize: 15, fontWeight: 400 }}> / {progress.total}</span>
          </Text>
        </div>
        <ProgressBar value={progress.ratio} />
      </Card>

      <Card style={{ padding: '4px 16px' }}>
        {habits.length === 0 ? (
          <Text variant="body" style={{ color: t.color.text2, textAlign: 'center', padding: '20px 0' }}>
            No habits yet. Add your first one.
          </Text>
        ) : (
          habits.map((habit, index) => {
            const stats = statsFor(habit.id);
            if (!stats) return null;
            return (
              <div key={habit.id}>
                {index > 0 && <Divider />}
                <div style={{ padding: '12px 0' }}>
                  <HabitTile
                    habit={habit}
                    stats={stats}
                    onToggleToday={() => toggleToday(habit.id)}
                    onToggleDay={(date) => toggle(habit.id, date)}
                    onRename={() => onOpenEditor({ habit })}
                    onRemove={() => removeHabit(habit.id)}
                  />
                </div>
              </div>
            );
          })
        )}
      </Card>
    </>
  );
}

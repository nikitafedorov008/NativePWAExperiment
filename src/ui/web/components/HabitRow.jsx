import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/ui/web/components/ui/button';
import { Checkbox } from '@/ui/web/components/ui/checkbox';
import StreakBadge from './StreakBadge.jsx';
import WeekStrip from './WeekStrip.jsx';

export default function HabitRow({ habit, stats, onToggleToday, onToggleDay, onRename, onRemove }) {
  const doneToday = stats.weekStrip.some((day) => day.isToday && day.done);
  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={doneToday}
          onCheckedChange={onToggleToday}
          aria-label={`${habit.name}: done today`}
          className="size-5"
        />
        <span className="text-2xl leading-none" aria-hidden="true">
          {habit.emoji}
        </span>
        <button
          type="button"
          onClick={onRename}
          aria-label={`Rename ${habit.name}`}
          className="group flex min-w-0 flex-1 items-center gap-1.5 rounded-sm text-left font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="truncate">{habit.name}</span>
          <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </button>
        <StreakBadge count={stats.currentStreak} />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${habit.name}`}
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>
      <WeekStrip days={stats.weekStrip} onToggle={onToggleDay} className="pl-8" />
    </li>
  );
}

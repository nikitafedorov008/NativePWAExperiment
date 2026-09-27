import { cn } from '@/ui/web/lib/utils';

const dotClass = (day, interactive) =>
  cn(
    'flex size-7 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors',
    day.done
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-muted/40 text-muted-foreground',
    day.isToday && !day.done && 'border-2 border-foreground/60 text-foreground',
    interactive &&
      'cursor-pointer outline-none hover:border-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  );

const dayLabel = (day) => `${day.weekday} ${day.dayOfMonth}: ${day.done ? 'done' : 'not done'}`;

export default function WeekStrip({ days, onToggle, className }) {
  const interactive = typeof onToggle === 'function';
  return (
    <div className={cn('grid grid-cols-7 gap-1', className)} role="group" aria-label="Last 7 days">
      {days.map((day) => (
        <div key={day.date} className="flex flex-col items-center gap-1">
          <span
            className={cn(
              'text-[10px] leading-none uppercase text-muted-foreground',
              day.isToday && 'font-semibold text-foreground',
            )}
            aria-hidden="true"
          >
            {day.weekday}
          </span>
          {interactive ? (
            <button
              type="button"
              aria-label={dayLabel(day)}
              aria-pressed={day.done}
              onClick={() => onToggle(day.date)}
              className={dotClass(day, true)}
            >
              {day.dayOfMonth}
            </button>
          ) : (
            <span role="img" aria-label={dayLabel(day)} className={dotClass(day, false)}>
              {day.dayOfMonth}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const dotClass = (day) =>
  `week-dot${day.done ? ' done' : ''}${day.isToday && !day.done ? ' today' : ''}`;

const dayLabel = (day) => `${day.weekday} ${day.dayOfMonth}: ${day.done ? 'done' : 'not done'}`;

export default function WeekDots({ days, onToggle, className }) {
  const interactive = typeof onToggle === 'function';
  return (
    <div className={`week-dots${className ? ` ${className}` : ''}`} role="group" aria-label="Last 7 days">
      {days.map((day) => (
        <div key={day.date} className="week-col">
          <span className={`week-wd${day.isToday ? ' today' : ''}`} aria-hidden="true">
            {day.weekday}
          </span>
          {interactive ? (
            <button
              type="button"
              aria-label={dayLabel(day)}
              aria-pressed={day.done}
              onClick={() => onToggle(day.date)}
              className={dotClass(day)}
            >
              {day.dayOfMonth}
            </button>
          ) : (
            <span role="img" aria-label={dayLabel(day)} className={dotClass(day)}>
              {day.dayOfMonth}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

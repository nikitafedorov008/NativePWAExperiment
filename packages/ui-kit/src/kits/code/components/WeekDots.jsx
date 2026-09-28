import { useTheme } from '../../../theme.jsx';

const dayLabel = (day) => `${day.weekday} ${day.dayOfMonth}: ${day.done ? 'done' : 'not done'}`;

export default function WeekDots({ days, onToggle }) {
  const t = useTheme();
  const interactive = typeof onToggle === 'function';
  const dotStyle = (day) => ({
    width: 28, height: 28, borderRadius: 999, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    font: t.type.caption, fontVariantNumeric: 'tabular-nums',
    background: day.done ? t.color.brand : t.color.surfaceAlt,
    color: day.done ? t.color.onBrand : t.color.text2,
    border: day.isToday && !day.done ? `2px solid ${t.color.text}` : '1px solid transparent',
    fontWeight: day.isToday || day.done ? 600 : 400,
    boxSizing: 'border-box',
  });
  return (
    <div role="group" aria-label="Last 7 days" style={{ display: 'flex', gap: 6, width: '100%' }}>
      {days.map((day) => (
        <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
          <span
            aria-hidden="true"
            style={{
              ...t.type.caption, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3,
              color: day.isToday ? t.color.text : t.color.text2, fontWeight: day.isToday ? 650 : 400,
            }}
          >
            {day.weekday}
          </span>
          {interactive ? (
            <button
              type="button" className="pressable" aria-label={dayLabel(day)} aria-pressed={day.done}
              onClick={() => onToggle(day.date)} style={dotStyle(day)}
            >
              {day.dayOfMonth}
            </button>
          ) : (
            <span role="img" aria-label={dayLabel(day)} style={dotStyle(day)}>{day.dayOfMonth}</span>
          )}
        </div>
      ))}
    </div>
  );
}

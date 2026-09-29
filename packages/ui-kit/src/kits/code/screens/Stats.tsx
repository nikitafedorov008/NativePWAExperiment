import { useStore } from 'zustand';
import { useStatsViewModel } from '../../../context.ts';
import { useTheme } from '../../../theme.tsx';
import { Card, Text } from '../../../widgets.tsx';
import WeekDots from '../components/WeekDots.tsx';

export default function Stats() {
  const t = useTheme();
  const { tiles, items } = useStore(useStatsViewModel());

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {tiles.map((tile) => (
          <Card key={tile.label} style={{ gap: 3, padding: 14 }}>
            <Text variant="caption">{tile.label}</Text>
            <Text variant="headline" style={{ fontSize: 19, fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tile.value}
            </Text>
          </Card>
        ))}
      </div>

      <Card style={{ padding: '4px 16px' }}>
        <div style={{ padding: '12px 4px 4px' }}>
          <Text variant="headline">Habits</Text>
          <Text variant="caption" style={{ display: 'block' }}>Streaks and the last 7 days</Text>
        </div>
        {items.length === 0 ? (
          <Text variant="body" style={{ textAlign: 'center', padding: '20px 0', opacity: 0.55 }}>No habits yet.</Text>
        ) : (
          items.map((item, index) => (
            <div key={item.id} style={{ padding: '12px 4px' }}>
              {index > 0 && <div style={{ height: 1, background: t.color.divider, marginBottom: 12 }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                  <Text variant="body" style={{ fontWeight: 550, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Text>
                </div>
                <div style={{ paddingLeft: 34 }}>
                  <Text variant="caption" style={{ display: 'block', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
                    {item.summary}
                  </Text>
                  <WeekDots days={item.days} />
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

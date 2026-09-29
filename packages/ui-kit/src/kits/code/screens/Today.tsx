import { useStore } from 'zustand';
import { Pencil, Trash2 } from 'lucide-react';
import { useInstallViewModel, useTodayViewModel } from '../../../context.ts';
import { useTheme } from '../../../theme.tsx';
import { Badge, Card, Checkbox, Divider, IconButton, ProgressBar, Text } from '../../../widgets.tsx';
import type { TodayItem } from '../../../types.ts';
import InstallBanner from '../components/InstallBanner.tsx';
import WeekDots from '../components/WeekDots.tsx';

function HabitTile({ item }: { item: TodayItem }) {
  const today = useTodayViewModel();
  const toggleToday = useStore(today, (state) => state.toggleToday);
  const toggleDay = useStore(today, (state) => state.toggleDay);
  const openEditor = useStore(today, (state) => state.openEditor);
  const remove = useStore(today, (state) => state.remove);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Checkbox
          checked={item.doneToday}
          onChange={() => toggleToday(item.id)}
          label={`${item.name}: done today`}
        />
        <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
        <button
          type="button" className="pressable"
          aria-label={`Rename ${item.name}`} onClick={() => openEditor(item.id)}
          style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left', borderRadius: 6, padding: '2px 0' }}
        >
          <Text variant="body" style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </Text>
          <Pencil size={12} style={{ opacity: 0.55, flexShrink: 0 }} aria-hidden="true" />
        </button>
        {item.streak > 0 && <Badge>🔥 {item.streak}</Badge>}
        <IconButton icon={Trash2} label={`Delete ${item.name}`} onClick={() => remove(item.id)} />
      </div>
      <WeekDots days={item.days} onToggle={(date) => toggleDay(item.id, date)} />
    </div>
  );
}

export default function Today() {
  const t = useTheme();
  const today = useTodayViewModel();
  const install = useInstallViewModel();
  const { progress, items } = useStore(today);
  const { visible } = useStore(install);

  return (
    <>
      {visible && <InstallBanner />}

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
        {items.length === 0 ? (
          <Text variant="body" style={{ color: t.color.text2, textAlign: 'center', padding: '20px 0' }}>
            No habits yet. Add your first one.
          </Text>
        ) : (
          items.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Divider />}
              <div style={{ padding: '12px 0' }}>
                <HabitTile item={item} />
              </div>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useDomainConstants, useHabits } from '../../../context.ts';
import { useTheme } from '../../../theme.tsx';
import { Button, Dialog, Text, TextInput } from '../../../widgets.tsx';
import type { Habit } from '../../../types.ts';

function EmojiPicker({
  value,
  onChange,
  presets,
}: {
  value: string;
  onChange(emoji: string): void;
  presets: readonly string[];
}) {
  const t = useTheme();
  return (
    <div role="radiogroup" aria-label="Emoji" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
      {presets.map((preset) => {
        const selected = preset === value;
        return (
          <button
            key={preset}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={preset}
            className="pressable"
            onClick={() => onChange(preset)}
            style={{
              aspectRatio: 1, fontSize: 22, borderRadius: t.radius.input,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${selected ? t.color.brand : t.color.border}`,
              background: selected ? t.color.brandSoft : t.color.surfaceAlt,
            }}
          >
            {preset}
          </button>
        );
      })}
    </div>
  );
}

export interface HabitFormDialogProps {
  open: boolean;
  habit: Habit | null;
  onClose(): void;
}

export default function HabitFormDialog({ open, habit, onClose }: HabitFormDialogProps) {
  const { addHabit, renameHabit } = useHabits();
  const { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } = useDomainConstants();
  const editing = Boolean(habit);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(DEFAULT_EMOJI);

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? '');
      setEmoji(habit?.emoji ?? DEFAULT_EMOJI);
    }
  }, [open, habit, DEFAULT_EMOJI]);

  const canSubmit = name.trim() !== '';

  const submit = (): void => {
    if (!canSubmit) return;
    const ok = editing && habit ? renameHabit(habit.id, { name, emoji }) : addHabit({ name, emoji });
    if (ok) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Rename habit' : 'New habit'}
      actions={
        <>
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit}>{editing ? 'Save' : 'Add habit'}</Button>
        </>
      }
    >
      <Text variant="caption" style={{ marginTop: -10 }}>Give it a short name and pick an emoji.</Text>
      <TextInput
        label="Name"
        value={name}
        onChange={setName}
        placeholder="e.g. Drink water"
        maxLength={NAME_MAX_LENGTH}
        autoFocus
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Text variant="label">Emoji</Text>
        <EmojiPicker value={emoji} onChange={setEmoji} presets={EMOJI_PRESETS} />
      </div>
    </Dialog>
  );
}

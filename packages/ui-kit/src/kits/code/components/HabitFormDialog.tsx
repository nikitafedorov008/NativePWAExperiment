import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { useDomainConstants, useTodayViewModel } from '../../../context.ts';
import { useTheme } from '../../../theme.tsx';
import { Button, Dialog, Text, TextInput } from '../../../widgets.tsx';

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

/**
 * The habit form is a dumb view over the Today view model: open/close state and
 * the habit being edited both live in the store, the form only holds the
 * in-progress text until it is submitted.
 */
export default function HabitFormDialog() {
  const today = useTodayViewModel();
  const { editor } = useStore(today);
  const closeEditor = useStore(today, (state) => state.closeEditor);
  const submitEditor = useStore(today, (state) => state.submitEditor);
  const { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } = useDomainConstants();
  const habit = editor.habit;
  const editing = Boolean(habit);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(DEFAULT_EMOJI);

  useEffect(() => {
    if (editor.open) {
      setName(habit?.name ?? '');
      setEmoji(habit?.emoji ?? DEFAULT_EMOJI);
    }
  }, [editor.open, habit, DEFAULT_EMOJI]);

  const canSubmit = name.trim() !== '';

  const submit = (): void => {
    if (!canSubmit) return;
    submitEditor({ name, emoji });
  };

  return (
    <Dialog
      open={editor.open}
      onClose={closeEditor}
      title={editing ? 'Rename habit' : 'New habit'}
      actions={
        <>
          <Button variant="text" onClick={closeEditor}>Cancel</Button>
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

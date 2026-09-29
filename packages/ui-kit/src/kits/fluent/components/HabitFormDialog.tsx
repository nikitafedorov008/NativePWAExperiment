import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
  Label,
} from '@fluentui/react-components';
import { useDomainConstants, useHabits } from '../../../context.ts';
import type { Habit } from '../../../types.ts';

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
    <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{editing ? 'Rename habit' : 'New habit'}</DialogTitle>
          <DialogContent>
            <div className="form-field">
              <Label htmlFor="fluent-habit-name">Name</Label>
              <Input
                id="fluent-habit-name"
                value={name}
                maxLength={NAME_MAX_LENGTH}
                placeholder="e.g. Drink water"
                autoFocus
                className="name-input"
                onChange={(_, data) => setName(data.value)}
              />
            </div>
            <div className="form-field">
              <Label>Emoji</Label>
              <div role="radiogroup" aria-label="Emoji" className="emoji-grid">
                {EMOJI_PRESETS.map((preset) => {
                  const selected = preset === emoji;
                  return (
                    <button
                      key={preset}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={preset}
                      onClick={() => setEmoji(preset)}
                      className={`emoji-btn${selected ? ' selected' : ''}`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" disabled={!canSubmit} onClick={submit}>
              {editing ? 'Save' : 'Add habit'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

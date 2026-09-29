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
import { useDomainConstants, useTodayViewModel } from '../../../context.ts';
import { useObservable } from '../../../hooks.ts';

export default function HabitFormDialog() {
  const today = useTodayViewModel();
  const { editor } = useObservable(today);
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
    today.submitEditor({ name, emoji });
  };

  return (
    <Dialog open={editor.open} onOpenChange={(_, data) => { if (!data.open) today.closeEditor(); }}>
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
            <Button appearance="secondary" onClick={today.closeEditor}>Cancel</Button>
            <Button appearance="primary" disabled={!canSubmit} onClick={submit}>
              {editing ? 'Save' : 'Add habit'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

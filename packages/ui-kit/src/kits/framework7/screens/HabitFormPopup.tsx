import { useEffect, useState } from 'react';
import { Block, List, ListInput, Link, NavLeft, NavRight, NavTitle, Navbar, Page, Popup } from 'framework7-react';
import { useDomainConstants, useHabits } from '../../../context.ts';
import type { Habit } from '../../../types.ts';

export interface HabitFormPopupProps {
  open: boolean;
  habit: Habit | null;
  onClose(): void;
}

export default function HabitFormPopup({ open, habit, onClose }: HabitFormPopupProps) {
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
    <Popup opened={open} closeOnEscape onPopupClosed={onClose}>
      <Page>
        <Navbar>
          <NavLeft>
            <Link onClick={onClose}>Cancel</Link>
          </NavLeft>
          <NavTitle>{editing ? 'Rename habit' : 'New habit'}</NavTitle>
          <NavRight>
            <Link
              className={canSubmit ? '' : 'disabled'}
              style={{ fontWeight: canSubmit ? 600 : 400 }}
              onClick={submit}
            >
              {editing ? 'Save' : 'Add'}
            </Link>
          </NavRight>
        </Navbar>
        <List strong inset form onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <ListInput
            label="Name"
            type="text"
            placeholder="e.g. Drink water"
            value={name}
            // F7's own types lag its runtime here (`maxLength` is forwarded to
            // the input element); keep the React-cased prop and widen it.
            {...({ maxLength: NAME_MAX_LENGTH } as Record<string, unknown>)}
            clearButton
            onInput={(event) => setName((event.target as HTMLInputElement).value)}
          />
        </List>
        <Block>
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
        </Block>
      </Page>
    </Popup>
  );
}

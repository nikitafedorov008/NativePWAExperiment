import { useEffect, useState } from 'react';
import { Block, List, ListInput, Link, NavLeft, NavRight, NavTitle, Navbar, Page, Popup } from 'framework7-react';
import { useDomainConstants, useHabits } from '../../../context.js';

export default function HabitFormPopup({ open, habit, onClose }) {
  const { addHabit, renameHabit } = useHabits();
  const { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } = useDomainConstants();
  const editing = Boolean(habit);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? '');
      setEmoji(habit?.emoji ?? DEFAULT_EMOJI);
    }
  }, [open, habit, DEFAULT_EMOJI]);

  const canSubmit = name.trim() !== '';

  const submit = () => {
    if (!canSubmit) return;
    const ok = editing ? renameHabit(habit.id, { name, emoji }) : addHabit({ name, emoji });
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
            <Link strong={canSubmit} className={canSubmit ? '' : 'disabled'} onClick={submit}>
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
            maxLength={NAME_MAX_LENGTH}
            clearButton
            onChange={(event) => setName(event.target.value)}
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

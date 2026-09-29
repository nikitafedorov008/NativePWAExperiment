import { useEffect, useState } from 'react';
import { Block, List, ListInput, Link, NavLeft, NavRight, NavTitle, Navbar, Page, Popup } from 'framework7-react';
import { useDomainConstants, useTodayViewModel } from '../../../context.ts';
import { useObservable } from '../../../hooks.ts';

export default function HabitFormPopup() {
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
    <Popup opened={editor.open} closeOnEscape onPopupClosed={today.closeEditor}>
      <Page>
        <Navbar>
          <NavLeft>
            <Link onClick={today.closeEditor}>Cancel</Link>
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

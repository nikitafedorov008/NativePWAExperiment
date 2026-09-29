import { useStore } from 'zustand';
import {
  Badge,
  Block,
  Icon,
  Link,
  List,
  ListItem,
  Progressbar,
  SwipeoutActions,
  SwipeoutButton,
} from 'framework7-react';
import { useInstallViewModel, useTodayViewModel } from '../../../context.ts';
import WeekDots from '../components/WeekDots.tsx';

export default function TodayScreen() {
  const today = useTodayViewModel();
  const { progress, items } = useStore(today);
  const toggleToday = useStore(today, (state) => state.toggleToday);
  const toggleDay = useStore(today, (state) => state.toggleDay);
  const openEditor = useStore(today, (state) => state.openEditor);
  const remove = useStore(today, (state) => state.remove);

  const install = useInstallViewModel();
  const installState = useStore(install);

  return (
    <>
      <Block strong className="today-progress">
        <div className="today-progress-row">
          <span className="today-progress-num">
            {progress.done}
            <span className="muted"> / {progress.total}</span>
          </span>
          <span className="today-progress-label">done today</span>
        </div>
        <Progressbar progress={Math.round(progress.ratio * 100)} aria-label="Today's progress" />
      </Block>

      {installState.visible && (
        <Block strong>
          <p className="install-steps-title">Install Streaks</p>
          {installState.canPrompt ? (
            <Link onClick={() => installState.prompt()}>Install app</Link>
          ) : (
            <ol className="install-steps">
              {installState.instructions.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </Block>
      )}

      {items.length === 0 ? (
        <Block strong className="empty-hint">No habits yet. Add your first one.</Block>
      ) : (
        <List strong inset>
          {items.map((item) => (
            <ListItem key={item.id} swipeout className="habit-item">
              <button
                slot="media"
                type="button"
                aria-label={`${item.name}: done today`}
                aria-pressed={item.doneToday}
                className={`habit-check${item.doneToday ? ' done' : ''}`}
                onClick={() => toggleToday(item.id)}
              >
                <Icon ios="f7:checkmark" md="material:check" />
              </button>
              <button
                slot="title"
                type="button"
                className="habit-name"
                aria-label={`Rename ${item.name}`}
                onClick={() => openEditor(item.id)}
              >
                <span className="habit-emoji" aria-hidden="true">{item.emoji}</span>
                <span className="habit-name-text">{item.name}</span>
              </button>
              <span slot="after" className="habit-after">
                {item.streak > 0 && <Badge>🔥 {item.streak}</Badge>}
                <Link
                  className="habit-icon-btn"
                  iconIos="f7:pencil"
                  iconMaterial="edit"
                  aria-label={`Rename ${item.name}`}
                  onClick={() => openEditor(item.id)}
                />
                <Link
                  className="habit-icon-btn danger"
                  iconIos="f7:trash"
                  iconMaterial="delete"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => remove(item.id)}
                />
              </span>
              <div slot="inner" className="habit-week">
                <WeekDots days={item.days} onToggle={(date) => toggleDay(item.id, date)} />
              </div>
              <SwipeoutActions right>
                <SwipeoutButton delete onClick={() => remove(item.id)}>
                  <Icon ios="f7:trash" md="material:delete" /> Delete
                </SwipeoutButton>
              </SwipeoutActions>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}

import {
  Badge,
  Button,
  Caption1,
  Card,
  Checkbox,
  ProgressBar,
  Text,
  Title2,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { useInstallViewModel, useTodayViewModel } from '../../../context.ts';
import { useObservable } from '../../../hooks.ts';
import HabitFormDialog from '../components/HabitFormDialog.tsx';
import WeekDots from '../components/WeekDots.tsx';

export default function TodayScreen() {
  const today = useTodayViewModel();
  const install = useInstallViewModel();
  const { todayLabel, progress, items } = useObservable(today);
  const { visible } = useObservable(install);

  return (
    <section className="fluent-screen">
      <header className="fluent-screen-header">
        <div>
          <Caption1 block>Today</Caption1>
          <Title2>{todayLabel}</Title2>
        </div>
        <Button appearance="primary" icon={<AddRegular />} onClick={() => today.openEditor(null)}>
          Add habit
        </Button>
      </header>

      {visible && <InstallBannerSlot />}

      <Card>
        <div className="habit-row-main" style={{ justifyContent: 'space-between' }}>
          <Text size={300}>Progress</Text>
          <Text size={400} weight="semibold" className="tile-value">
            {progress.done} <Text size={300} weight="regular">/ {progress.total}</Text>
          </Text>
        </div>
        <ProgressBar value={progress.ratio} thickness="large" aria-label="Today's progress" />
      </Card>

      <Card>
        {items.length === 0 ? (
          <Text size={300}>No habits yet. Add your first one.</Text>
        ) : (
          <ul className="habit-list">
            {items.map((item) => (
              <li key={item.id} className="habit-row">
                <div className="habit-row-main">
                  <Checkbox
                    checked={item.doneToday}
                    onChange={() => today.toggleToday(item.id)}
                    aria-label={`${item.name}: done today`}
                  />
                  <span className="habit-emoji" aria-hidden="true">{item.emoji}</span>
                  <button
                    type="button"
                    className="habit-name"
                    aria-label={`Rename ${item.name}`}
                    onClick={() => today.openEditor(item.id)}
                  >
                    {item.name}
                  </button>
                  {item.streak > 0 && (
                    <Badge appearance="filled" color="brand" aria-label={`${item.streak} day streak`}>
                      🔥 {item.streak}
                    </Badge>
                  )}
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<EditRegular />}
                    aria-label={`Rename ${item.name}`}
                    onClick={() => today.openEditor(item.id)}
                  />
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<DeleteRegular />}
                    aria-label={`Delete ${item.name}`}
                    onClick={() => today.remove(item.id)}
                  />
                </div>
                <WeekDots
                  days={item.days}
                  onToggle={(date) => today.toggleDay(item.id, date)}
                  className="habit-week-dots"
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <HabitFormDialog />
    </section>
  );
}

/** The install banner lives in the build via the shared app styles. */
function InstallBannerSlot() {
  const install = useInstallViewModel();
  const state = useObservable(install);
  return (
    <Card>
      <div className="habit-row-main" style={{ justifyContent: 'space-between' }}>
        <Text weight="semibold">Install Streaks</Text>
        <Button appearance="subtle" size="small" onClick={install.dismiss}>Dismiss</Button>
      </div>
      {state.canPrompt ? (
        <Button appearance="primary" onClick={install.prompt}>Install app</Button>
      ) : (
        <div>
          <Text size={300} weight="semibold" block>{state.instructions.title}</Text>
          <ol className="install-steps">
            {state.instructions.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}

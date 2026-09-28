import {
  Block,
  BlockFooter,
  BlockHeader,
  BlockTitle,
  List,
  ListButton,
  ListItem,
  f7,
} from 'framework7-react';
import { useHabits, useInstall, usePlatform } from '../../../context.js';
import { DESIGN_OPTIONS } from '../../../designSystems.js';

export default function SettingsScreen() {
  const { resetAll } = useHabits();
  const { os, browser, displayMode, designSystem, installed, override, setOverride } = usePlatform();
  const { canPrompt, promptInstall, outcome, instructions } = useInstall();

  const confirmReset = () => {
    f7.dialog.confirm(
      'Your habits and completions will be deleted and replaced with the four demo habits.',
      'Reset all data?',
      () => resetAll(),
    );
  };

  const rows = [
    ['Platform', os],
    ['Browser', browser],
    ['Display mode', displayMode],
    ['Design system', designSystem],
    ['Install status', installed ? 'Installed' : 'Browser tab'],
  ];

  return (
    <>
      <BlockTitle>Platform</BlockTitle>
      <List strong inset>
        {rows.map(([label, value]) => (
          <ListItem key={label} title={label} after={String(value)} />
        ))}
      </List>

      <BlockTitle>Design system preview</BlockTitle>
      <BlockHeader>Force a design language to preview it in this tab. Changing it reloads the page.</BlockHeader>
      <List strong inset>
        {DESIGN_OPTIONS.map((option) => {
          const value = option.value ?? 'auto';
          return (
            <ListItem
              key={value}
              radio
              name="design"
              value={value}
              title={option.label}
              checked={(override ?? 'auto') === value}
              onChange={() => setOverride(option.value)}
            />
          );
        })}
      </List>

      <BlockTitle>Install app</BlockTitle>
      {installed ? (
        <Block strong>Already installed — you are using the native look.</Block>
      ) : outcome === 'accepted' ? (
        <Block strong>Installed — open Streaks from your home screen / dock.</Block>
      ) : canPrompt ? (
        <List strong inset>
          <ListButton title="Install app" onClick={() => promptInstall()} />
        </List>
      ) : (
        <Block strong>
          <p className="install-steps-title">{instructions.title}</p>
          <ol className="install-steps">
            {instructions.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Block>
      )}

      <BlockTitle>Reset data</BlockTitle>
      <List strong inset>
        <ListButton color="red" title="Reset to demo habits" onClick={confirmReset} />
      </List>
      <BlockFooter>Clears everything and restores the four demo habits.</BlockFooter>
    </>
  );
}

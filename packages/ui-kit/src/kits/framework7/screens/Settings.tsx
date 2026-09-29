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
import { useSettingsViewModel } from '../../../context.ts';
import { useObservable } from '../../../hooks.ts';

export default function SettingsScreen() {
  const settings = useSettingsViewModel();
  const { rows, design, install } = useObservable(settings);

  const confirmReset = (): void => {
    f7.dialog.confirm(
      'Your habits and completions will be deleted and replaced with the four demo habits.',
      'Reset all data?',
      () => settings.confirmReset(),
    );
  };

  return (
    <>
      <BlockTitle>Platform</BlockTitle>
      <List strong inset>
        {rows.map((row) => (
          <ListItem key={row.label} title={row.label} after={row.value} />
        ))}
      </List>

      <BlockTitle>Design system preview</BlockTitle>
      <BlockHeader>Force a design language to preview it in this tab. Changing it reloads the page.</BlockHeader>
      <List strong inset>
        {design.options.map((option) => {
          const value = option.value ?? 'auto';
          return (
            <ListItem
              key={value}
              radio
              name="design"
              value={value}
              title={option.label}
              checked={(design.override ?? 'auto') === value}
              onChange={() => settings.setDesign(option.value)}
            />
          );
        })}
      </List>

      <BlockTitle>Install app</BlockTitle>
      {install.installed ? (
        <Block strong>Already installed — you are using the native look.</Block>
      ) : install.outcome === 'accepted' ? (
        <Block strong>Installed — open Streaks from your home screen / dock.</Block>
      ) : install.canPrompt ? (
        <List strong inset>
          <ListButton title="Install app" onClick={settings.promptInstall} />
        </List>
      ) : (
        <Block strong>
          <p className="install-steps-title">{install.instructions.title}</p>
          <ol className="install-steps">
            {install.instructions.steps.map((step) => (
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

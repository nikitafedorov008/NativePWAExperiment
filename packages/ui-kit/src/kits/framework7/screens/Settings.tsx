import { useStore } from 'zustand';
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

export default function SettingsScreen() {
  const settings = useSettingsViewModel();
  const { rows, design, install } = useStore(settings);
  const setDesign = useStore(settings, (state) => state.setDesign);
  const confirmReset = useStore(settings, (state) => state.confirmReset);
  const promptInstall = useStore(settings, (state) => state.promptInstall);

  const askReset = (): void => {
    f7.dialog.confirm(
      'Your habits and completions will be deleted and replaced with the four demo habits.',
      'Reset all data?',
      () => confirmReset(),
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
              onChange={() => setDesign(option.value)}
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
          <ListButton title="Install app" onClick={promptInstall} />
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
        <ListButton color="red" title="Reset to demo habits" onClick={askReset} />
      </List>
      <BlockFooter>Clears everything and restores the four demo habits.</BlockFooter>
    </>
  );
}

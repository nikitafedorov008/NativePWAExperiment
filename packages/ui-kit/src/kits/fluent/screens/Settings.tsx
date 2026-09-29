import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Divider,
  Radio,
  RadioGroup,
  Text,
  Title2,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular, ArrowDownloadRegular } from '@fluentui/react-icons';
import { useSettingsViewModel } from '../../../context.ts';
import type { DesignSystem } from '../../../types.ts';

function CardTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <Text weight="semibold" block>{title}</Text>
      {description && <Text size={300} block>{description}</Text>}
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <Card>
      <CardTitle title={title} description={description} />
      {children}
    </Card>
  );
}

export default function SettingsScreen() {
  const settings = useSettingsViewModel();
  const { rows, design, install, resetOpen } = useStore(settings);
  const setDesign = useStore(settings, (state) => state.setDesign);
  const requestReset = useStore(settings, (state) => state.requestReset);
  const cancelReset = useStore(settings, (state) => state.cancelReset);
  const confirmReset = useStore(settings, (state) => state.confirmReset);
  const promptInstall = useStore(settings, (state) => state.promptInstall);

  return (
    <section className="fluent-screen">
      <Title2>Settings</Title2>

      <Card>
        <CardTitle title="Platform" description="What the app detected at start" />
        <dl className="info-list">
          {rows.map((row, index) => (
            <Fragment key={row.label}>
              {index > 0 && <Divider />}
              <div className="info-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            </Fragment>
          ))}
        </dl>
      </Card>

      <SectionCard
        title="Design system preview"
        description="Force a design language to preview it in this tab. Changing it reloads the page."
      >
        <RadioGroup
          value={design.override ?? 'auto'}
          onChange={(_, data) => setDesign(data.value === 'auto' ? null : (data.value as DesignSystem))}
        >
          {design.options.map((option) => (
            <Radio key={option.value ?? 'auto'} value={option.value ?? 'auto'} label={option.label} />
          ))}
        </RadioGroup>
      </SectionCard>

      <SectionCard
        title="Install app"
        description={install.installed ? 'Already installed' : 'Get the native look for your platform.'}
      >
        {install.installed ? null : install.outcome === 'accepted' ? (
          <Text size={300}>Installed — open Streaks from your taskbar / Start menu.</Text>
        ) : install.canPrompt ? (
          <Button appearance="primary" icon={<ArrowDownloadRegular />} onClick={promptInstall}>
            Install app
          </Button>
        ) : (
          <div>
            <Text size={300} weight="semibold" block>{install.instructions.title}</Text>
            <ol className="install-steps">
              {install.instructions.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </SectionCard>

      <Card>
        <CardTitle title="Reset data" description="Clear everything and restore the demo habits." />
        <Button
          appearance="secondary"
          icon={<ArrowClockwiseRegular />}
          className="destructive-text"
          onClick={requestReset}
        >
          Reset data
        </Button>
        <Dialog open={resetOpen} onOpenChange={(_, data) => { if (!data.open) cancelReset(); }}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Reset all data?</DialogTitle>
              <DialogContent>
                Your habits and completions will be deleted and replaced with the four demo habits.
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={cancelReset}>Cancel</Button>
                <Button appearance="primary" className="destructive-text" onClick={confirmReset}>
                  Reset
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </Card>

      <Card>
        <CardTitle
          title="About"
          description="One domain layer, six design languages — Cupertino, Material, Fluent, Yaru, custom, shadcn."
        />
      </Card>
    </section>
  );
}

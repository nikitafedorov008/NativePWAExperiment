import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';
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
import { useHabits, useInstall, usePlatform } from '../../../context.ts';
import { DESIGN_OPTIONS } from '../../../designSystems.ts';
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
  const { resetAll } = useHabits();
  const { os, browser, displayMode, designSystem, installed, override, setOverride } = usePlatform();
  const { canPrompt, promptInstall, outcome, instructions } = useInstall();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows: [string, string][] = [
    ['Platform', os],
    ['Browser', browser],
    ['Display mode', displayMode],
    ['Design system', designSystem],
    ['Install status', installed ? 'Installed' : 'Browser tab'],
  ];

  return (
    <section className="fluent-screen">
      <Title2>Settings</Title2>

      <Card>
        <CardTitle title="Platform" description="What the app detected at start" />
        <dl className="info-list">
          {rows.map(([label, value], index) => (
            <Fragment key={label}>
              {index > 0 && <Divider />}
              <div className="info-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
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
          value={override ?? 'auto'}
          onChange={(_, data) => setOverride(data.value === 'auto' ? null : (data.value as DesignSystem))}
        >
          {DESIGN_OPTIONS.map((option) => (
            <Radio key={option.value ?? 'auto'} value={option.value ?? 'auto'} label={option.label} />
          ))}
        </RadioGroup>
      </SectionCard>

      <SectionCard
        title="Install app"
        description={installed ? 'Already installed' : 'Get the native look for your platform.'}
      >
        {installed ? null : outcome === 'accepted' ? (
          <Text size={300}>Installed — open Streaks from your taskbar / Start menu.</Text>
        ) : canPrompt ? (
          <Button appearance="primary" icon={<ArrowDownloadRegular />} onClick={() => void promptInstall()}>
            Install app
          </Button>
        ) : (
          <div>
            <Text size={300} weight="semibold" block>{instructions.title}</Text>
            <ol className="install-steps">
              {instructions.steps.map((step) => (
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
          onClick={() => setConfirmOpen(true)}
        >
          Reset data
        </Button>
        <Dialog open={confirmOpen} onOpenChange={(_, data) => setConfirmOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Reset all data?</DialogTitle>
              <DialogContent>
                Your habits and completions will be deleted and replaced with the four demo habits.
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button
                  appearance="primary"
                  className="destructive-text"
                  onClick={() => {
                    resetAll();
                    setConfirmOpen(false);
                  }}
                >
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

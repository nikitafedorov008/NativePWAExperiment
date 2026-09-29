import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import { Download, RotateCcw } from 'lucide-react';
import { useSettingsViewModel } from '../../../context.ts';
import { useTheme } from '../../../theme.tsx';
import { Button, Card, Dialog, ListTile, Radio, Text } from '../../../widgets.tsx';

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <Card style={{ gap: 8 }}>
      <div>
        <Text variant="headline" style={{ display: 'block' }}>{title}</Text>
        {subtitle && <Text variant="caption" style={{ display: 'block' }}>{subtitle}</Text>}
      </div>
      {children}
    </Card>
  );
}

function InstallSection() {
  const t = useTheme();
  const settings = useSettingsViewModel();
  const { install } = useStore(settings);
  const promptInstall = useStore(settings, (state) => state.promptInstall);

  if (install.installed) {
    return <SectionCard title="Install app" subtitle="Already installed — you are using the native look." />;
  }
  return (
    <SectionCard title="Install app" subtitle="Get the native look for your platform.">
      {install.outcome === 'accepted' ? (
        <Text variant="body" style={{ fontWeight: 550 }}>
          Installed — open Streaks from your home screen / dock.
        </Text>
      ) : install.canPrompt ? (
        <Button icon={Download} onClick={promptInstall}>Install app</Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text variant="label">{install.instructions.title}</Text>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {install.instructions.steps.map((step) => (
              <li key={step}><Text variant="caption" style={{ color: t.color.text2 }}>{step}</Text></li>
            ))}
          </ol>
        </div>
      )}
    </SectionCard>
  );
}

export default function Settings() {
  const t = useTheme();
  const settings = useSettingsViewModel();
  const { rows, design, resetOpen } = useStore(settings);
  const setDesign = useStore(settings, (state) => state.setDesign);
  const requestReset = useStore(settings, (state) => state.requestReset);
  const cancelReset = useStore(settings, (state) => state.cancelReset);
  const confirmReset = useStore(settings, (state) => state.confirmReset);

  return (
    <>
      <SectionCard title="Platform" subtitle="What the app detected at start">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((row, index) => (
            <div key={row.label}>
              {index > 0 && <div style={{ height: 1, background: t.color.divider }} />}
              <ListTile title={row.label} trailing={<Text variant="body" style={{ fontWeight: 550 }}>{row.value}</Text>} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Design system preview"
        subtitle="Force a design language to preview it in this tab. Changing it reloads the page."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {design.options.map((option) => {
            const value = option.value ?? 'auto';
            return (
              <Radio
                key={value}
                label={option.label}
                checked={(design.override ?? 'auto') === value}
                onChange={() => setDesign(option.value)}
              />
            );
          })}
        </div>
      </SectionCard>

      <InstallSection />

      <SectionCard title="Reset data" subtitle="Clear everything and restore the demo habits.">
        <div>
          <Button variant="danger" icon={RotateCcw} onClick={requestReset}>
            Reset data
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="About" subtitle="One domain layer, six design languages — Cupertino, Material, Fluent, Yaru, custom, shadcn." />

      <Dialog
        open={resetOpen}
        onClose={cancelReset}
        title="Reset all data?"
        actions={
          <>
            <Button variant="text" onClick={cancelReset}>Cancel</Button>
            <Button variant="danger" onClick={confirmReset}>Reset</Button>
          </>
        }
      >
        <Text variant="body">Your habits and completions will be deleted and replaced with the four demo habits.</Text>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useHabits, useInstall, usePlatform } from '../../../context.js';
import { DESIGN_OPTIONS } from '../../../designSystems.js';
import { useTheme } from '../../../theme.jsx';
import { Button, Card, Dialog, ListTile, Radio, Text } from '../../../widgets.jsx';

function SectionCard({ title, subtitle, children }) {
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
  const { canPrompt, promptInstall, outcome, instructions } = useInstall();
  const { installed } = usePlatform();

  if (installed) {
    return <SectionCard title="Install app" subtitle="Already installed — you are using the native look." />;
  }
  return (
    <SectionCard title="Install app" subtitle="Get the native look for your platform.">
      {outcome === 'accepted' ? (
        <Text variant="body" style={{ fontWeight: 550 }}>
          Installed — open Streaks from your home screen / dock.
        </Text>
      ) : canPrompt ? (
        <Button icon={Download} onClick={() => promptInstall()}>Install app</Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text variant="label">{instructions.title}</Text>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {instructions.steps.map((step) => (
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
  const { resetAll } = useHabits();
  const { os, browser, displayMode, designSystem, installed, override, setOverride } = usePlatform();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows = [
    ['Platform', os],
    ['Browser', browser],
    ['Display mode', displayMode],
    ['Design system', designSystem],
    ['Install status', installed ? 'Installed' : 'Browser tab'],
  ];

  return (
    <>
      <SectionCard title="Platform" subtitle="What the app detected at start">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map(([label, value], index) => (
            <div key={label}>
              {index > 0 && <div style={{ height: 1, background: t.color.divider }} />}
              <ListTile title={label} trailing={<Text variant="body" style={{ fontWeight: 550 }}>{String(value)}</Text>} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Design system preview"
        subtitle="Force a design language to preview it in this tab. Changing it reloads the page."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DESIGN_OPTIONS.map((option) => {
            const value = option.value ?? 'auto';
            return (
              <Radio
                key={value}
                label={option.label}
                checked={(override ?? 'auto') === value}
                onChange={() => setOverride(option.value)}
              />
            );
          })}
        </div>
      </SectionCard>

      <InstallSection />

      <SectionCard title="Reset data" subtitle="Clear everything and restore the demo habits.">
        <div>
          <Button variant="danger" icon={RotateCcw} onClick={() => setConfirmOpen(true)}>
            Reset data
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="About" subtitle="One domain layer, six design languages — Cupertino, Material, Fluent, Yaru, custom, shadcn." />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset all data?"
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirmOpen(false);
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <Text variant="body">Your habits and completions will be deleted and replaced with the four demo habits.</Text>
      </Dialog>
    </>
  );
}

import { useStore } from 'zustand';
import { X } from 'lucide-react';
import { useInstallViewModel } from '../../../context.ts';
import { useTheme } from '../../../theme.tsx';
import { Button, Card, IconButton, Text } from '../../../widgets.tsx';

export default function InstallBanner() {
  const t = useTheme();
  const install = useInstallViewModel();
  const state = useStore(install);
  const dismiss = useStore(install, (s) => s.dismiss);
  const prompt = useStore(install, (s) => s.prompt);

  if (state.outcome === 'accepted') {
    return (
      <Card style={{ position: 'relative', gap: 10 }}>
        <Text variant="headline">Install Streaks</Text>
        <Text variant="body" style={{ fontWeight: 550 }}>Installed — open Streaks from your home screen / dock.</Text>
      </Card>
    );
  }

  return (
    <Card style={{ position: 'relative', gap: 10 }}>
      <div style={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton icon={X} label="Dismiss install banner" onClick={dismiss} />
      </div>
      <Text variant="headline">Install Streaks</Text>
      <Text variant="caption">
        Install to get the native look: Cupertino on iPhone &amp; Mac, Material on Android, Yaru on Ubuntu,
        Fluent on Windows.
      </Text>
      {state.canPrompt ? (
        <Button onClick={prompt}>Install app</Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Text variant="label">{state.instructions.title}</Text>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {state.instructions.steps.map((step) => (
              <li key={step}><Text variant="caption" style={{ color: t.color.text2 }}>{step}</Text></li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}

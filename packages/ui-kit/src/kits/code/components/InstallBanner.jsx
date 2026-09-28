import { X } from 'lucide-react';
import { useInstall } from '../../../context.js';
import { useTheme } from '../../../theme.jsx';
import { Button, Card, IconButton, Text } from '../../../widgets.jsx';

function InstallAction() {
  const t = useTheme();
  const { canPrompt, promptInstall, outcome, instructions } = useInstall();
  if (outcome === 'accepted') {
    return <Text variant="body" style={{ fontWeight: 550 }}>Installed — open Streaks from your home screen / dock.</Text>;
  }
  if (canPrompt) {
    return <Button onClick={() => promptInstall()}>Install app</Button>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Text variant="label">{instructions.title}</Text>
      <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {instructions.steps.map((step) => (
          <li key={step}><Text variant="caption" style={{ color: t.color.text2 }}>{step}</Text></li>
        ))}
      </ol>
    </div>
  );
}

export default function InstallBanner() {
  const { dismiss } = useInstall();
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
      <InstallAction />
    </Card>
  );
}

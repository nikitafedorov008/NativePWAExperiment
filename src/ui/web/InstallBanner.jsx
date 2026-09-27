import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/platform/useInstallPrompt.js';
import { Button } from '@/ui/web/components/ui/button';
import { Card, CardContent } from '@/ui/web/components/ui/card';
import pwaLogo from './assets/pwa-logo.svg?raw';

function InstallAction() {
  const { canPrompt, promptInstall, outcome, instructions } = useInstallPrompt();
  if (outcome === 'accepted') {
    return <p className="text-sm font-medium">Installed — open Streaks from your dock / home screen</p>;
  }
  if (canPrompt) {
    return (
      <Button onClick={() => promptInstall()}>
        <Download />
        Install app
      </Button>
    );
  }
  return (
    <div className="text-sm">
      <p className="font-medium">{instructions.title}</p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-muted-foreground">
        {instructions.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

export default function InstallBanner() {
  const { dismiss } = useInstallPrompt();
  return (
    <Card className="relative py-5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss install banner"
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground"
      >
        <X />
      </Button>
      <CardContent className="flex flex-col gap-4 px-5 pr-12 sm:flex-row sm:items-start sm:gap-6">
        <span
          role="img"
          aria-label="PWA"
          className="block w-24 shrink-0 text-neutral-700 [&_svg]:h-auto [&_svg]:w-full dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: pwaLogo }}
        />
        <div className="grid min-w-0 flex-1 gap-3">
          <div className="grid gap-1">
            <h2 className="leading-none font-semibold">Install Streaks</h2>
            <p className="text-sm text-muted-foreground">
              Install to get the native look: Cupertino on iPhone &amp; Mac, Material on Android &amp; Linux, Fluent on
              Windows.
            </p>
          </div>
          <InstallAction />
        </div>
      </CardContent>
    </Card>
  );
}

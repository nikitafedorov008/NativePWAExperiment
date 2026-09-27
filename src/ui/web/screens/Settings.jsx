import { Fragment, useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useHabits } from '@/domain/habits/HabitsContext.jsx';
import { DESIGN_OPTIONS } from '@/platform/detect.js';
import { usePlatform } from '@/platform/PlatformContext.jsx';
import { Button } from '@/ui/web/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/web/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/web/components/ui/dialog';
import { Label } from '@/ui/web/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/ui/web/components/ui/radio-group';
import { Separator } from '@/ui/web/components/ui/separator';

function InfoRows({ rows }) {
  return (
    <dl>
      {rows.map(([label, value], index) => (
        <Fragment key={label}>
          {index > 0 && <Separator />}
          <div className="flex items-center justify-between gap-4 py-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        </Fragment>
      ))}
    </dl>
  );
}

function DesignPreview() {
  const { override, setOverride } = usePlatform();
  return (
    <RadioGroup value={override ?? 'auto'} onValueChange={(value) => setOverride(value === 'auto' ? null : value)}>
      {DESIGN_OPTIONS.map((option) => {
        const value = option.value ?? 'auto';
        const id = `design-${value}`;
        return (
          <div key={value} className="flex items-center gap-3">
            <RadioGroupItem value={value} id={id} />
            <Label htmlFor={id} className="font-normal">
              {option.label}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

function ResetButton() {
  const { resetAll } = useHabits();
  const [open, setOpen] = useState(false);
  const confirm = () => {
    resetAll();
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <RotateCcw />
        Reset data
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset all data?</DialogTitle>
          <DialogDescription>
            Your habits and completions will be deleted and replaced with the four demo habits.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm}>
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Settings({ onInstall }) {
  const { os, browser, displayMode, designSystem, installed } = usePlatform();
  const rows = [
    ['Platform', os],
    ['Browser', browser],
    ['Display mode', displayMode],
    ['Design system', designSystem],
    ['Install status', installed ? 'Installed' : 'Browser tab'],
  ];

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Platform</CardTitle>
          <CardDescription>What the app detected at start</CardDescription>
        </CardHeader>
        <CardContent>
          <InfoRows rows={rows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design system preview</CardTitle>
          <CardDescription>Force a UI kit to preview it in this tab. Changing it reloads the page.</CardDescription>
        </CardHeader>
        <CardContent>
          <DesignPreview />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Install app</CardTitle>
          <CardDescription>
            {installed ? 'Already installed' : 'Get the native look for your platform.'}
          </CardDescription>
        </CardHeader>
        {!installed && (
          <CardContent>
            <Button variant="outline" onClick={onInstall}>
              <Download />
              Show install instructions
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset data</CardTitle>
          <CardDescription>Clear everything and restore the demo habits.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>One domain layer, four UIs — Cupertino, Material, Fluent, shadcn</CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}

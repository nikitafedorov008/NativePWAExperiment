import { describe, expect, it } from 'vitest';
import { InstallService, installInstructions } from '../install_service.ts';

describe('installInstructions', () => {
  const OSES = ['ios', 'macos', 'android', 'windows', 'linux', 'unknown'];
  const BROWSERS = ['safari', 'chrome', 'edge', 'firefox', 'other'];

  it('returns a title and non-empty steps for every os × browser combo', () => {
    OSES.forEach((os) =>
      BROWSERS.forEach((browser) => {
        const { title, steps } = installInstructions({ os, browser });
        expect(title.length).toBeGreaterThan(0);
        expect(steps.length).toBeGreaterThan(0);
        steps.forEach((step) => expect(step.length).toBeGreaterThan(0));
      }),
    );
  });

  it('uses the Safari share flow on iOS and asks other browsers to open Safari', () => {
    expect(installInstructions({ os: 'ios', browser: 'safari' })).toEqual({
      title: 'Install on iPhone/iPad',
      steps: ['Tap the Share button', "Choose 'Add to Home Screen'", 'Tap Add'],
    });
    expect(installInstructions({ os: 'ios', browser: 'chrome' }).steps[0]).toBe('Open this page in Safari');
  });

  it('uses Add to Dock on macOS Safari and Chrome steps on macOS Chrome', () => {
    expect(installInstructions({ os: 'macos', browser: 'safari' })).toEqual({
      title: 'Install on Mac',
      steps: ['Open the File menu', "Choose 'Add to Dock…'", 'Click Add'],
    });
    expect(installInstructions({ os: 'macos', browser: 'chrome' }).steps[0]).toMatch(/install icon/);
    expect(installInstructions({ os: 'windows', browser: 'edge' }).steps[0]).toMatch(/app icon/);
  });

  it('handles Android and Firefox variants', () => {
    expect(installInstructions({ os: 'android', browser: 'chrome' }).steps[1]).toMatch(/Install app/);
    expect(installInstructions({ os: 'android', browser: 'firefox' }).steps[0]).toBe('Open the menu (⋮)');
    expect(installInstructions({ os: 'windows', browser: 'firefox' }).steps[0]).toMatch(/Firefox 142\+/);
    expect(installInstructions({ os: 'linux', browser: 'firefox' }).steps[0]).toMatch(/doesn't support/);
    expect(installInstructions({ os: 'unknown', browser: 'other' }).steps[0]).toMatch(/Chrome, Edge or Safari/);
  });
});

describe('InstallService', () => {
  it('reports no prompt until the browser offers one', () => {
    const service = new InstallService();
    expect(service.state).toEqual({ canPrompt: false, installed: false, outcome: null });
  });

  it('answers "unavailable" when nothing was captured', async () => {
    const service = new InstallService();
    await expect(service.prompt()).resolves.toBe('unavailable');
  });
});

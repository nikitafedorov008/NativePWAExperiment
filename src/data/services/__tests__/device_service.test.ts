import { describe, expect, it } from 'vitest';
import { DeviceService } from '../device_service.ts';

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  macChrome:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  winEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
  winFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  linuxChrome:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
};

describe('DeviceService.os', () => {
  it('maps the modern platform hint first', () => {
    expect(new DeviceService(UA.macChrome, 'Windows').os).toBe('windows');
    expect(new DeviceService(UA.winEdge, 'macOS').os).toBe('macos');
    expect(new DeviceService('', 'Android').os).toBe('android');
    expect(new DeviceService('', 'Chrome OS').os).toBe('linux');
    expect(new DeviceService('', 'iOS').os).toBe('ios');
  });

  it('falls back to the user agent', () => {
    expect(new DeviceService(UA.iphoneSafari, '').os).toBe('ios');
    expect(new DeviceService(UA.macChrome, '').os).toBe('macos');
    expect(new DeviceService(UA.winFirefox, '').os).toBe('windows');
    expect(new DeviceService(UA.androidChrome, '').os).toBe('android');
    expect(new DeviceService(UA.linuxChrome, '').os).toBe('linux');
  });

  it('reports unknown for unrecognised input', () => {
    expect(new DeviceService('SomethingElse/1.0', '').os).toBe('unknown');
    expect(new DeviceService('', '').os).toBe('unknown');
  });
});

describe('DeviceService.browser', () => {
  it('orders Edge before Chrome before Safari', () => {
    expect(new DeviceService(UA.winEdge, '').browser).toBe('edge');
    expect(new DeviceService(UA.macChrome, '').browser).toBe('chrome');
    expect(new DeviceService(UA.macSafari, '').browser).toBe('safari');
    expect(new DeviceService(UA.iphoneSafari, '').browser).toBe('safari');
  });

  it('detects Firefox and falls back to other', () => {
    expect(new DeviceService(UA.winFirefox, '').browser).toBe('firefox');
    expect(new DeviceService('Opera/9.80', '').browser).toBe('other');
  });
});

describe('DeviceService.snapshot', () => {
  it('summarizes the device without touching the DOM', () => {
    const snapshot = new DeviceService(UA.linuxChrome, 'Linux').snapshot();
    expect(snapshot).toMatchObject({ os: 'linux', browser: 'chrome', displayMode: 'browser' });
    expect(typeof snapshot.isTouch).toBe('boolean');
  });
});

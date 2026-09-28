import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DESIGN,
  DESIGN_LANGUAGES,
  DESIGN_OPTIONS,
  DESIGN_SYSTEMS,
  languageOf,
  resolveDesignSystem,
} from '../designSystems.js';

describe('DESIGN_SYSTEMS', () => {
  it('exposes the six design languages, named after the design language itself', () => {
    expect(DESIGN_SYSTEMS).toEqual(['cupertino', 'material', 'fluent', 'yaru', 'custom', 'shadcn']);
  });

  it('never leaks engine-internal names into the public list', () => {
    ['ios', 'md', 'web'].forEach((internal) => expect(DESIGN_SYSTEMS).not.toContain(internal));
  });

  it('describes every language with a kit and, where relevant, an engine theme', () => {
    DESIGN_SYSTEMS.forEach((id) => {
      const language = DESIGN_LANGUAGES[id];
      expect(language).toBeDefined();
      expect(['framework7', 'fluent', 'code']).toContain(language.kit);
      expect(typeof language.family).toBe('string');
    });
    expect(DESIGN_LANGUAGES.cupertino).toMatchObject({ kit: 'framework7', theme: 'ios' });
    expect(DESIGN_LANGUAGES.material).toMatchObject({ kit: 'framework7', theme: 'md' });
  });
});

describe('resolveDesignSystem', () => {
  const OS = ['ios', 'macos', 'android', 'windows', 'linux', 'unknown'];

  it('falls back to the custom design in a browser tab on every OS', () => {
    OS.forEach((os) => expect(resolveDesignSystem({ os, installed: false, override: null })).toBe('custom'));
  });

  it('maps an installed OS to its native design language', () => {
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: null })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'macos', installed: true, override: null })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'android', installed: true, override: null })).toBe('material');
    expect(resolveDesignSystem({ os: 'windows', installed: true, override: null })).toBe('fluent');
    expect(resolveDesignSystem({ os: 'linux', installed: true, override: null })).toBe('yaru');
    expect(resolveDesignSystem({ os: 'unknown', installed: true, override: null })).toBe('custom');
  });

  it('lets a valid override win over detection', () => {
    expect(resolveDesignSystem({ os: 'windows', installed: true, override: 'cupertino' })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'ios', installed: false, override: 'material' })).toBe('material');
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: 'shadcn' })).toBe('shadcn');
  });

  it('ignores invalid or engine-internal overrides', () => {
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: 'bogus' })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: 'ios' })).toBe('cupertino');
    expect(resolveDesignSystem({ os: 'ios', installed: true, override: undefined })).toBe('cupertino');
  });
});

describe('languageOf', () => {
  it('returns the descriptor for a known language', () => {
    expect(languageOf('yaru').kit).toBe('code');
    expect(languageOf('fluent').kit).toBe('fluent');
  });

  it('falls back to the default design for unknown input', () => {
    expect(languageOf('nope')).toBe(DESIGN_LANGUAGES[DEFAULT_DESIGN]);
    expect(languageOf(undefined)).toBe(DESIGN_LANGUAGES[DEFAULT_DESIGN]);
  });
});

describe('DESIGN_OPTIONS', () => {
  it('lists auto plus every design language', () => {
    expect(DESIGN_OPTIONS[0]).toEqual({ value: null, label: 'Auto (detect)' });
    expect(DESIGN_OPTIONS.slice(1).map((o) => o.value)).toEqual(DESIGN_SYSTEMS);
    DESIGN_OPTIONS.forEach((o) => expect(typeof o.label).toBe('string'));
  });
});

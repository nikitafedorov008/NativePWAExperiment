process.env.TZ = 'America/New_York';

import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatDateKey,
  lastNDays,
  msUntilNextMidnight,
  parseDateKey,
  toDateKey,
  todayKey,
} from '../dates.ts';

describe('toDateKey / parseDateKey', () => {
  it('uses local time, not UTC', () => {
    expect(toDateKey(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
    expect(toDateKey(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });

  it('zero-pads month and day', () => {
    expect(toDateKey(new Date(2026, 2, 5))).toBe('2026-03-05');
  });

  it('round-trips through local midnight', () => {
    const date = parseDateKey('2026-09-05');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(0);
    expect(toDateKey(date)).toBe('2026-09-05');
  });

  it('todayKey matches toDateKey(now)', () => {
    expect(todayKey()).toBe(toDateKey(new Date()));
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('never skips or duplicates a day across the spring DST transition', () => {
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-03-09', -1)).toBe('2026-03-08');
    expect(addDays('2026-03-08', -1)).toBe('2026-03-07');
  });

  it('never skips or duplicates a day across the autumn DST transition', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02');
    expect(addDays('2026-11-02', -1)).toBe('2026-11-01');
  });

  it('walks a full year one day at a time without gaps', () => {
    let key = '2026-01-01';
    const seen = new Set([key]);
    for (let i = 0; i < 365; i += 1) {
      const next = addDays(key, 1);
      expect(addDays(next, -1)).toBe(key);
      expect(seen.has(next)).toBe(false);
      seen.add(next);
      key = next;
    }
    expect(key).toBe('2027-01-01');
  });

  it('handles zero and multi-day offsets', () => {
    expect(addDays('2026-09-05', 0)).toBe('2026-09-05');
    expect(addDays('2026-09-05', -13)).toBe('2026-08-23');
  });
});

describe('lastNDays', () => {
  it('returns n keys oldest to newest ending at today', () => {
    expect(lastNDays('2026-03-10', 7)).toEqual([
      '2026-03-04',
      '2026-03-05',
      '2026-03-06',
      '2026-03-07',
      '2026-03-08',
      '2026-03-09',
      '2026-03-10',
    ]);
  });

  it('returns just today for n=1', () => {
    expect(lastNDays('2026-09-05', 1)).toEqual(['2026-09-05']);
  });
});

describe('formatDateKey', () => {
  it('formats via Intl without touching UTC', () => {
    expect(formatDateKey('2026-09-05', { weekday: 'short' })).toBe('Sat');
    expect(formatDateKey('2026-09-05', { weekday: 'long', day: 'numeric', month: 'long' })).toContain(
      'Saturday',
    );
  });
});

describe('msUntilNextMidnight', () => {
  it('is positive and lands on the next local midnight', () => {
    const now = new Date(2026, 8, 5, 22, 30);
    const ms = msUntilNextMidnight(now);
    expect(ms).toBe(90 * 60 * 1000);
    expect(toDateKey(new Date(now.getTime() + ms))).toBe('2026-09-06');
  });

  it('accounts for a 23-hour DST day', () => {
    const now = new Date(2026, 2, 8, 0, 30);
    expect(msUntilNextMidnight(now)).toBe(22.5 * 60 * 60 * 1000);
  });
});

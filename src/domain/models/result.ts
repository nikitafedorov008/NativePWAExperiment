/**
 * domain/models/result — the app's error contract.
 *
 * Repositories and use cases return `Result` instead of throwing: expected
 * failures (bad name, unknown id, future date, unavailable prompt) are values
 * the view model can render, and only truly unexpected errors propagate.
 */

export type Result<T> = { ok: true; value: T } | { ok: false; error: Failure };

export type Failure =
  | 'empty-name'
  | 'unknown-habit'
  | 'invalid-date'
  | 'future-date'
  | 'unavailable'
  | 'storage';

export const ok = <T,>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T,>(error: Failure): Result<T> => ({ ok: false, error });

export const isOk = <T,>(result: Result<T>): result is { ok: true; value: T } => result.ok;

export const valueOr = <T,>(result: Result<T>, fallback: T): T =>
  result.ok ? result.value : fallback;

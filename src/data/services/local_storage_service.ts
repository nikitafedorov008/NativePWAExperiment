/**
 * data/services/local_storage_service — the single place that touches
 * `localStorage`. Services are the lowest layer: they wrap one external data
 * source, hold no domain state, and never throw at the caller.
 */
export class LocalStorageService {
  constructor(private readonly prefix = '') {}

  #key(key: string): string {
    return this.prefix ? `${this.prefix}.${key}` : key;
  }

  /** Returns null when the value is missing, unreadable or not valid JSON. */
  read<T>(key: string): T | null {
    try {
      const raw = globalThis.localStorage?.getItem(this.#key(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  write(key: string, value: unknown): boolean {
    try {
      globalThis.localStorage?.setItem(this.#key(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  readString(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(this.#key(key)) ?? null;
    } catch {
      return null;
    }
  }

  writeString(key: string, value: string): boolean {
    try {
      globalThis.localStorage?.setItem(this.#key(key), value);
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(this.#key(key));
    } catch {
      /* private mode: nothing to clean up */
    }
  }
}

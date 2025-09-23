type StorageType = "local" | "session";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
}

interface StoredValue {
  value: string;
  expiresAt?: number; // epoch ms
}

export class StorageProvider {
  private local: StorageLike;
  private session: StorageLike;
  private db: number;

  constructor(db: number = 0) {
    this.local = window.localStorage;
    this.session = window.sessionStorage;
    this.db = db;
  }

  /** Build a namespaced key */
  private withDb(key: string): string {
    return `db${this.db}:${key}`;
  }

  /** Get from either local or session storage, respecting expiration */
  getItem(type: StorageType, key: string): string | undefined {
    const raw = this.getStore(type).getItem(this.withDb(key));
    if (!raw) return undefined;

    try {
      const parsed: StoredValue = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        // expired → cleanup
        this.removeItem(type, key);
        return undefined;
      }
      return parsed.value;
    } catch {
      // fallback if old plain string
      return raw;
    }
  }

  /** Set to either local or session storage, with optional expiration (ms) */
  setItem(type: StorageType, key: string, value: string, ttlMs?: number): void {
    const stored: StoredValue = { value };
    if (ttlMs && ttlMs > 0) {
      stored.expiresAt = Date.now() + ttlMs;
    }
    this.getStore(type).setItem(this.withDb(key), JSON.stringify(stored));
  }

  /** Remove from either local or session storage */
  removeItem(type: StorageType, key: string): void {
    this.getStore(type).removeItem(this.withDb(key));
  }

  /** Clear only keys for this db */
  clear(type: StorageType): void {
    const store = this.getStore(type);
    const prefix = `db${this.db}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => store.removeItem(k));
  }

  /** Get key at index (but only within this db, ignoring expired) */
  key(type: StorageType, index: number): string | null {
    const keys = this.getFilteredKeys(type);
    return keys[index] ?? null;
  }

  /** Get number of items (only for this db, ignoring expired) */
  length(type: StorageType): number {
    return this.getFilteredKeys(type).length;
  }

  private getFilteredKeys(type: StorageType): string[] {
    const store = this.getStore(type);
    const prefix = `db${this.db}:`;

    const filteredKeys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (!k || !k.startsWith(prefix)) continue;

      const raw = store.getItem(k);
      if (!raw) continue;

      try {
        const parsed: StoredValue = JSON.parse(raw);
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          // expired → cleanup
          store.removeItem(k);
          continue;
        }
      } catch {
        // allow legacy plain strings
      }
      filteredKeys.push(k.substring(prefix.length));
    }
    return filteredKeys;
  }

  private getStore(type: StorageType): StorageLike {
    return type === "local" ? this.local : this.session;
  }
}
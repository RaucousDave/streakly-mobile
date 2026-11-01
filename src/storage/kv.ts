/**
 * Web fallback for the key/value store. Metro resolves `kv.native.ts` on
 * iOS and Android, so MMKV is never pulled into the web bundle.
 */
type Store = {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
};

function memoryStore(): Store {
  const map = new Map<string, string>();

  return {
    getString: (key) => map.get(key),
    set: (key, value) => {
      map.set(key, value);
    },
    remove: (key) => {
      map.delete(key);
    },
  };
}

function webStore(): Store {
  if (typeof window === 'undefined' || !window.localStorage) {
    return memoryStore();
  }

  return {
    getString: (key) => window.localStorage.getItem(key) ?? undefined,
    set: (key, value) => {
      window.localStorage.setItem(key, value);
    },
    remove: (key) => {
      window.localStorage.removeItem(key);
    },
  };
}

export const kv: Store = webStore();

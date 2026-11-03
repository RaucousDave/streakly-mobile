type Store = {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
};

function memoryStore(): Store {
  const map = new Map<string, string>();

  return {
    getString: (key) => map.get(key),
    set: (key, value) => map.set(key, value),
    remove: (key) => map.delete(key),
  };
}

function createStore(): Store {
  try {
    // MMKV is a native module and is not bundled by Expo Go. Keep the
    // require inside the guard so Expo Go can still boot the client.
    // Development/release builds use the persistent MMKV implementation.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    const storage = createMMKV({ id: 'streakly' });

    return {
      getString: (key) => storage.getString(key),
      set: (key, value) => storage.set(key, value),
      remove: (key) => storage.remove(key),
    };
  } catch {
    // Expo Go has no MMKV native module. The fallback is intentionally
    // in-memory: it prevents startup crashes while making persistence
    // unavailable explicit to the development environment.
    return memoryStore();
  }
}

const storage = createStore();

/**
 * MMKV is synchronous, which is what the offline completion queue needs:
 * a check-in must survive the app being killed the instant after the tap.
 */
export const kv = {
  getString: (key: string) => storage.getString(key),
  set: (key: string, value: string) => storage.set(key, value),
  remove: (key: string) => storage.remove(key),
};

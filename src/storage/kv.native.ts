import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'streakly' });

/**
 * MMKV is synchronous, which is what the offline completion queue needs:
 * a check-in must survive the app being killed the instant after the tap.
 */
export const kv = {
  getString: (key: string) => storage.getString(key),
  set: (key: string, value: string) => storage.set(key, value),
  remove: (key: string) => storage.remove(key),
};

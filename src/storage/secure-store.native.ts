import * as SecureStore from 'expo-secure-store';

/**
 * Access and refresh tokens live in the Android Keystore / iOS Keychain,
 * never in the plain key/value store.
 */
export const secureStore = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  deleteItem: (key: string) => SecureStore.deleteItemAsync(key),
};

import { StorageKeys } from '@/constants/config';
import { kv } from '@/storage/kv';
import { secureStore } from '@/storage/secure-store';
import type { AuthUser, TokenPair } from '@/types/auth';

/**
 * In-memory session so request interceptors stay synchronous, mirrored
 * into SecureStore (tokens) and MMKV (the non-secret user snapshot).
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: AuthUser | null = null;
let hydrated = false;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const session = {
  get access() {
    return accessToken;
  },
  get refresh() {
    return refreshToken;
  },
  get user() {
    return currentUser;
  },
  get isHydrated() {
    return hydrated;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  async hydrate() {
    if (hydrated) {
      return;
    }

    const [access, refresh, user] = await Promise.all([
      secureStore.getItem(StorageKeys.accessToken),
      secureStore.getItem(StorageKeys.refreshToken),
      Promise.resolve(kv.getString(StorageKeys.sessionUser)),
    ]);

    accessToken = access;
    refreshToken = refresh;
    currentUser = user ? (JSON.parse(user) as AuthUser) : null;
    hydrated = true;
    notify();
  },
  async save(tokens: TokenPair, user?: AuthUser | null) {
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token ?? refreshToken;
    currentUser = user ?? currentUser;

    await Promise.all([
      secureStore.setItem(StorageKeys.accessToken, accessToken),
      refreshToken
        ? secureStore.setItem(StorageKeys.refreshToken, refreshToken)
        : Promise.resolve(),
      currentUser
        ? Promise.resolve(kv.set(StorageKeys.sessionUser, JSON.stringify(currentUser)))
        : Promise.resolve(),
    ]);

    notify();
  },
  async setUser(user: AuthUser) {
    currentUser = user;
    kv.set(StorageKeys.sessionUser, JSON.stringify(user));
    notify();
  },
  async clear() {
    accessToken = null;
    refreshToken = null;
    currentUser = null;

    await Promise.all([
      secureStore.deleteItem(StorageKeys.accessToken),
      secureStore.deleteItem(StorageKeys.refreshToken),
    ]);

    kv.remove(StorageKeys.sessionUser);
    notify();
  },
};

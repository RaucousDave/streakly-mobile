import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Android emulators cannot reach the host machine on `localhost`, and a
 * physical phone needs the LAN address of the Go server. Override with
 * EXPO_PUBLIC_API_URL when running against Render or a device.
 */
function defaultBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }

  return 'http://localhost:8000/api/v1';
}

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl()).replace(/\/$/, '');

export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export const REMINDER_HOUR = 20;

export const StorageKeys = {
  accessToken: 'streakly.access-token',
  refreshToken: 'streakly.refresh-token',
  sessionUser: 'streakly.session-user',
  queue: 'streakly.completion-queue',
  remindersEnabled: 'streakly.reminders-enabled',
  lastSeenDashboard: 'streakly.dashboard-cache',
} as const;

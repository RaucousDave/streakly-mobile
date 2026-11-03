import {
  AndroidImportance,
  SchedulableTriggerInputTypes,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { REMINDER_HOUR, StorageKeys } from '@/constants/config';
import { kv } from '@/storage/kv';

const REMINDER_ID = 'streakly.daily-reminder';

if (Platform.OS !== 'web') {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

function isEnabled() {
  return kv.getString(StorageKeys.remindersEnabled) === 'true';
}

/**
 * A single daily local notification, not a push campaign: the phone owns the
 * schedule, so it keeps working when the server does not.
 */
export function useReminders() {
  const [enabled, setEnabled] = useState(isEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disable = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      if (Platform.OS !== 'web') {
        await cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
      }

      kv.set(StorageKeys.remindersEnabled, 'false');
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  }, []);

  const enable = useCallback(async () => {
    if (Platform.OS === 'web') {
      setError('Daily reminders are available in the Android build.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (Platform.OS === 'android') {
        await setNotificationChannelAsync('reminders', {
          name: 'Daily reminder',
          importance: AndroidImportance.DEFAULT,
          lightColor: '#B96C10',
        });
      }

      const existing = await getPermissionsAsync();
      const granted = existing.granted
        ? true
        : (await requestPermissionsAsync()).granted;

      if (!granted) {
        setError('Notifications are blocked. Allow them in Android settings to use reminders.');
        return;
      }

      await cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
      await scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: {
          title: 'The ledger is open',
          body: 'One check-in keeps the streak. The minimum is enough.',
          sound: false,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          hour: REMINDER_HOUR,
          minute: 0,
          channelId: 'reminders',
        },
      });

      kv.set(StorageKeys.remindersEnabled, 'true');
      setEnabled(true);
    } catch {
      setError('The reminder could not be scheduled on this phone.');
    } finally {
      setBusy(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (enabled) {
      await disable();
    } else {
      await enable();
    }
  }, [disable, enable, enabled]);

  return { enabled, busy, error, toggle };
}


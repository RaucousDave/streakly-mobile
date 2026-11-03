import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptics are a platform courtesy, never a requirement: web has no motor and
 * some Android builds disable them, so every call swallows its failure.
 */
function run(action: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }

  void action().catch(() => {});
}

export function tapFeedback() {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function stampFeedback() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warnFeedback() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

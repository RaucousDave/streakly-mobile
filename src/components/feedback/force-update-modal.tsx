import { Linking, Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppConfig } from '@/hooks/use-app-config';
import { APP_VERSION } from '@/constants/config';

/**
 * Renders an un-dismissable full-screen modal when the server signals that
 * the running app version is below `min_supported_version`. The user must
 * open the store listing to continue — no back-button, no swipe-to-dismiss.
 */
export function ForceUpdateModal() {
  const { colors } = useTheme();
  const { data: config } = useAppConfig();

  const visible = config?.force_update === true;

  const openStore = () => {
    if (config?.update_url) {
      void Linking.openURL(config.update_url).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Prevent hardware back-button dismissal on Android.
      onRequestClose={() => {}}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="micro" color="textFaint">
            UPDATE REQUIRED
          </Text>

          <Text variant="h1">
            A new version is needed
          </Text>

          <Text variant="body" color="textMuted">
            Version {APP_VERSION} is no longer supported. Please update Streakly to keep
            your streaks safe and your check-ins syncing.
          </Text>

          {config?.latest_version ? (
            <Text variant="meta" color="textFaint">
              Latest version: {config.latest_version}
            </Text>
          ) : null}

          <Button
            label="Update now"
            onPress={openStore}
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.six,
    gap: Spacing.four,
  },
});

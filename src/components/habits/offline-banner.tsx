import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';

type OfflineBannerProps = {
  pending: number;
  syncing: boolean;
  onSync: () => void;
};

/**
 * Not an error state: the check-in already succeeded as far as the person is
 * concerned. The banner only says where it is being kept.
 */
export function OfflineBanner({ pending, syncing, onSync }: OfflineBannerProps) {
  const { colors } = useTheme();

  if (pending === 0) {
    return null;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
      <Ionicons name="cloud-offline-outline" size={18} color={colors.accent} />

      <View style={styles.copy}>
        <Text variant="bodyStrong" color="accent">
          {pending} {pending === 1 ? 'check-in is' : 'check-ins are'} on this phone
        </Text>
        <Text variant="meta" color="textMuted">
          {syncing ? 'Syncing now…' : 'They sync as soon as the server answers.'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sync check-ins now"
        accessibilityState={{ disabled: syncing, busy: syncing }}
        disabled={syncing}
        onPress={onSync}
        hitSlop={6}
        style={({ pressed }) => [styles.action, { opacity: syncing ? 0.5 : pressed ? 0.6 : 1 }]}>
        <Ionicons name="sync" size={18} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  action: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import { APP_VERSION } from '@/constants/config';
import { BrandMark } from '@/components/ui/brand-mark';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Hairline } from '@/components/ui/state-block';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useOfflineSyncContext } from '@/contexts/offline-context';
import { useAppConfig } from '@/hooks/use-app-config';
import { useDashboard } from '@/hooks/use-dashboard';
import { useReminders } from '@/hooks/use-reminders';
import { useTheme } from '@/hooks/use-theme';
import { timeZoneLabel } from '@/utils/timezone';

export default function ProfileScreen() {
  const { colors, isDark, toggleDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const { data } = useDashboard();
  const { data: config } = useAppConfig();
  const { pending, syncing, flush } = useOfflineSyncContext();
  const reminders = useReminders();
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = data?.user.display_name || user?.display_name || 'You';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'S';
  const provider = user?.provider === 'GOOGLE' ? 'Google account' : 'Email account';

  const leave = async () => {
    setSigningOut(true);

    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setConfirming(false);
    }
  };

  return (
    <Screen>
      <BrandMark />

      <View style={styles.hero}>
        <Text variant="display">Profile</Text>
        <Text variant="body" color="textMuted">
          The account, the reminder and the phone&apos;s copy of the ledger.
        </Text>
      </View>

      <SectionHeader title="Appearance" />

      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text variant="bodyStrong">Dark mode</Text>
            <Text variant="meta" color="textMuted">
              Use a darker ledger across the app.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Dark mode"
            value={isDark}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.surfaceSunken, true: colors.accentSoft }}
            thumbColor={isDark ? colors.accent : colors.textFaint}
          />
        </View>
      </View>

      <View style={[styles.identity, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
          <Text variant="h1" color="accent">
            {initial}
          </Text>
        </View>

        <View style={styles.identityCopy}>
          <Text variant="h2" numberOfLines={1}>
            {displayName}
          </Text>
          <Text variant="meta" color="textMuted" numberOfLines={1}>
            {user?.email || provider}
          </Text>
          <Text variant="micro" color="textFaint">
            {provider} · {timeZoneLabel(data?.user.timezone || user?.time_zone || 'UTC')}
          </Text>
        </View>
      </View>

      <View style={[styles.stats, { borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text variant="numeral">{data?.user.freeze_balance ?? 0}</Text>
          <Text variant="meta" color="textMuted">
            Freezes left
          </Text>
        </View>
        <View style={[styles.statRule, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text variant="numeral">{pending}</Text>
          <Text variant="meta" color="textMuted">
            Waiting to sync
          </Text>
        </View>
      </View>

      <SectionHeader title="Daily reminder" />

      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text variant="bodyStrong">Evening nudge</Text>
            <Text variant="meta" color="textMuted">
              One quiet notification at 20:00, only if the ledger is still open.
            </Text>
          </View>

          <Switch
            accessibilityLabel="Daily reminder at 20:00"
            value={reminders.enabled}
            onValueChange={() => void reminders.toggle()}
            disabled={reminders.busy}
            trackColor={{ false: colors.surfaceSunken, true: colors.accentSoft }}
            thumbColor={reminders.enabled ? colors.accent : colors.textFaint}
          />
        </View>

        {reminders.error ? (
          <>
            <Hairline />
            <Text variant="meta" color="danger">
              {reminders.error}
            </Text>
          </>
        ) : null}
      </View>

      <SectionHeader title="Offline" />

      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text variant="bodyStrong">
              {pending === 0 ? 'Everything is synced' : `${pending} check-in${pending === 1 ? '' : 's'} waiting`}
            </Text>
            <Text variant="meta" color="textMuted">
              Check-ins are written to this phone first, then replayed to the server.
            </Text>
          </View>

          {pending > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sync now"
              accessibilityState={{ busy: syncing, disabled: syncing }}
              disabled={syncing}
              onPress={() => void flush()}
              style={({ pressed }) => [
                styles.syncButton,
                { borderColor: colors.borderStrong, opacity: syncing ? 0.5 : pressed ? 0.6 : 1 },
              ]}>
              <Ionicons name="sync" size={18} color={colors.text} />
            </Pressable>
          ) : (
            <Ionicons name="checkmark-circle" size={22} color={colors.positive} />
          )}
        </View>
      </View>

      {config?.update_available ? (
        <>
          <SectionHeader title="Update" />
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Open the update page"
            onPress={() => void Linking.openURL(config.update_url).catch(() => {})}
            style={({ pressed }) => [
              styles.card,
              styles.row,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}>
            <View style={styles.rowCopy}>
              <Text variant="bodyStrong">Version {config.latest_version} is available</Text>
              <Text variant="meta" color="textMuted">
                You are on {APP_VERSION}. Tap to update.
              </Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.accent} />
          </Pressable>
        </>
      ) : null}

      <SectionHeader title="About" />

      <View style={[styles.card, { borderColor: colors.border }]}>
        <InfoRow label="Version" value={APP_VERSION} />
        <Hairline />
        <InfoRow label="Streaks" value="Counted in your time zone" />
      </View>

      <SectionHeader title="Session" />

      {confirming ? (
        <View style={[styles.card, { borderColor: colors.danger }]}>
          <Text variant="bodyStrong">Sign out of Streakly?</Text>
          <Text variant="meta" color="textMuted">
            Queued check-ins stay on this phone until they sync. Signing out clears the local
            ledger copy.
          </Text>
          <View style={styles.confirmRow}>
            <Button label="Cancel" variant="secondary" onPress={() => setConfirming(false)} />
            <Button label="Sign out" variant="danger" loading={signingOut} onPress={leave} />
          </View>
        </View>
      ) : (
        <Button label="Sign out" variant="danger" fullWidth onPress={() => setConfirming(true)} />
      )}

      <Text variant="meta" color="textFaint" align="center">
        Streakly keeps the minimum visible, because that is the part that has to survive a bad day.
      </Text>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="meta" color="textMuted">
        {label}
      </Text>
      <Text variant="meta" numberOfLines={1} style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.two,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  stats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingVertical: Spacing.four,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statRule: {
    width: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  rowCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
});

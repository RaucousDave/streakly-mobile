import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { BrandMark } from '@/components/ui/brand-mark';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { deviceTimeZone, timeZoneLabel } from '@/utils/timezone';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { signUpAndSignIn } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const timeZone = deviceTimeZone();

  const submit = async () => {
    setError(null);

    if (displayName.trim().length < 2) {
      setError('Tell us what to call you.');
      return;
    }

    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    setBusy(true);

    try {
      await signUpAndSignIn({
        display_name: displayName.trim(),
        email: email.trim(),
        password,
        timezone: timeZone,
      });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <BrandMark tally={0} />
      </View>

      <View style={styles.hero}>
        <Text variant="display">Start the ledger.</Text>
        <Text variant="body" color="textMuted">
          Pick a habit, set the smallest version that still counts, and mark it daily.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Field
          label="Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Ada"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
        />

        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          helper="At least 8 characters."
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        <View style={[styles.timezone, { borderColor: colors.border }]}>
          <Ionicons name="globe-outline" size={16} color={colors.textMuted} />
          <Text variant="meta" color="textMuted">
            Days are counted in {timeZoneLabel(timeZone)}.
          </Text>
        </View>

        {error ? (
          <Text variant="meta" color="danger">
            {error}
          </Text>
        ) : null}

        <Button
          label="Create account"
          onPress={submit}
          loading={busy}
          disabled={busy}
          size="lg"
          fullWidth
        />
      </View>

      <View style={styles.footer}>
        <Text variant="meta" color="textMuted">
          Already have an account?
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign in instead"
          onPress={() => router.back()}
          hitSlop={8}>
          <Text variant="label" color="accent">
            Sign in
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    minHeight: '100%',
    gap: Spacing.six,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    gap: Spacing.three,
    marginTop: Spacing.five,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.five,
    gap: Spacing.four,
  },
  timezone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.control,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
});

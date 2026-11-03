import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { errorMessage } from "@/api/client";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/hooks/use-theme";

export default function SignInScreen() {
  const { colors } = useTheme();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  const submit = async () => {
    setError(null);

    if (!email.includes("@") || password.length < 6) {
      setError("Enter your email and password.");
      return;
    }

    setBusy("email");

    try {
      await signIn(email.trim(), password);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    setError(null);
    setBusy("google");

    try {
      await signInWithGoogle();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <BrandMark />

      <View style={styles.hero}>
        <Text variant="display">Keep the streak alive.</Text>
        <Text variant="body" color="textMuted">
          One check-in a day. The minimum counts, the extra is a bonus.
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
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
          placeholder="Your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        {error ? (
          <Text variant="meta" color="danger">
            {error}
          </Text>
        ) : null}

        <Button
          label="Sign in"
          onPress={submit}
          loading={busy === "email"}
          disabled={busy !== null}
          size="lg"
          fullWidth
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
        <Text variant="micro" color="textFaint">
          OR
        </Text>
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        accessibilityState={{
          disabled: busy !== null,
          busy: busy === "google",
        }}
        disabled={busy !== null}
        onPress={google}
        style={({ pressed }) => [
          styles.google,
          {
            borderColor: colors.borderStrong,
            backgroundColor: colors.surface,
            opacity: busy !== null ? 0.5 : pressed ? 0.75 : 1,
          },
        ]}
      >
        <Ionicons name="logo-google" size={18} color={colors.text} />
        <Text variant="button">
          {busy === "google" ? "Connecting…" : "Continue with Google"}
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <Text variant="meta" color="textMuted">
          New here?
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create an account"
          onPress={() => router.push("/(auth)/sign-up")}
          hitSlop={8}
        >
          <Text variant="label" color="accent">
            Create an account
          </Text>
        </Pressable>
      </View>

      <Text variant="meta" color="textFaint" align="center">
        Your check-ins stay on this phone when you are offline.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    minHeight: "100%",
    gap: Spacing.six,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  google: {
    minHeight: 52,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
});

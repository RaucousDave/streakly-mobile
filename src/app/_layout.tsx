import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ForceUpdateModal } from "@/components/feedback/force-update-modal";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useAppFonts } from "@/hooks/use-app-fonts";
import { ThemePreferenceProvider, useTheme } from "@/hooks/use-theme";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen may already be hidden during a fast refresh.
});

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

function RootNavigator() {
  const { status } = useAuth();
  const { colors, isDark } = useTheme();
  const { loaded } = useAppFonts();

  useEffect(() => {
    if (loaded && status !== "loading") {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, status]);

  if (!loaded || status === "loading") {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
      notification: colors.accent,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Protected
          guard={status === "signedIn"}
          redirectTo="/(auth)/sign-in"
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="habit/new"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="habit/[id]" />
        </Stack.Protected>

        <Stack.Protected guard={status === "signedOut"} redirectTo="/(tabs)">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Screen name="+not-found" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <ThemePreferenceProvider>
              <RootNavigator />
              <ForceUpdateModal />
            </ThemePreferenceProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

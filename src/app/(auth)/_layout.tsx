import { Stack } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { API_BASE_URL } from "@/constants/config";

export default function AuthLayout() {
  const { colors } = useTheme();

  console.log("API_BASE_URL: ", API_BASE_URL);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

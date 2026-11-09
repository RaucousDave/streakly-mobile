import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { errorMessage } from "@/api/client";
import { listArchivedHabits, archiveHabit } from "@/api/habits.api";
import { queryKeys } from "@/api/query-keys";
import { BrandMark } from "@/components/ui/brand-mark";
import { Hairline, StateBlock } from "@/components/ui/state-block";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Habit } from "@/types/habit";

export default function ArchivedScreen() {
  const { colors } = useTheme();
  const { show } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.archivedHabits, queryFn: listArchivedHabits });

  const restore = async (habit: Habit) => {
    try {
      await archiveHabit(habit.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.archivedHabits }),
        queryClient.invalidateQueries({ queryKey: queryKeys.habits }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      show("Habit restored to today", "success");
    } catch (error) {
      show(errorMessage(error), "danger");
    }
  };

  if (query.isLoading) {
    return <Screen><BrandMark /><View style={styles.hero}><Text variant="display">Archived</Text><Text variant="body" color="textMuted">Reading the quiet shelf…</Text></View></Screen>;
  }

  if (query.isError) {
    return <Screen><BrandMark /><View style={styles.hero}><Text variant="display">Archived</Text></View><StateBlock icon="cloud-offline-outline" tone="danger" title="The archive is out of reach" body={errorMessage(query.error)} actionLabel="Try again" onAction={() => void query.refetch()} /></Screen>;
  }

  const habits = query.data ?? [];
  return (
    <Screen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.accent} colors={[colors.accent]} />}>
      <BrandMark />
      <View style={styles.hero}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={18} color={colors.textMuted} /><Text variant="label" color="textMuted">Profile</Text></Pressable>
        <Text variant="display">Archived</Text>
        <Text variant="body" color="textMuted">A record of habits you chose to put down.</Text>
      </View>
      {habits.length === 0 ? <StateBlock icon="archive-outline" title="Nothing archived" body="Habits you archive will stay here, ready to be restored when the time is right." /> : (
        <View style={styles.list}>
          <Text variant="meta" color="textMuted">{habits.length} {habits.length === 1 ? "habit" : "habits"}</Text>
          {habits.map((habit, index) => <View key={habit.id}>{index > 0 ? <Hairline /> : null}<View style={styles.row}><View style={styles.copy}><Text variant="bodyStrong">{habit.title}</Text><Text variant="meta" color="textMuted">{habit.type === "QUANTITATIVE" ? `${habit.target_qty ?? 0} ${habit.unit ?? "units"} a day` : "Check in once today"}</Text>{habit.archived_at ? <Text variant="micro" color="textFaint">Archived {new Date(habit.archived_at).toLocaleDateString()}</Text> : null}</View><Pressable accessibilityRole="button" accessibilityLabel={`Restore ${habit.title}`} onPress={() => void restore(habit)} style={({ pressed }) => [styles.restore, { borderColor: colors.borderStrong, opacity: pressed ? 0.6 : 1 }]}><Ionicons name="arrow-undo-outline" size={18} color={colors.accent} /><Text variant="label" color="accent">Restore</Text></Pressable></View></View>)}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.two },
  back: { flexDirection: "row", alignItems: "center", gap: Spacing.two, minHeight: 44 },
  list: { gap: Spacing.three },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.four, paddingVertical: Spacing.four },
  copy: { flex: 1, gap: Spacing.one },
  restore: { minHeight: 40, borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: Spacing.three, flexDirection: "row", alignItems: "center", gap: Spacing.one },
});

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { errorMessage } from "@/api/client";
import { HabitRow } from "@/components/habits/habit-row";
import { LogQuantitySheet } from "@/components/habits/log-quantity-sheet";
import { OfflineBanner } from "@/components/habits/offline-banner";
import { WeekStrip } from "@/components/habits/week-strip";
import { BrandMark } from "@/components/ui/brand-mark";
import { Hairline, StateBlock } from "@/components/ui/state-block";
import { HabitRowSkeleton } from "@/components/ui/skeleton";
import { Screen } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Radius, Spacing } from "@/constants/theme";
import { useAppConfig } from "@/hooks/use-app-config";
import { useCheckIn } from "@/hooks/use-check-in";
import { useDashboard } from "@/hooks/use-dashboard";
import { useOfflineSyncContext } from "@/contexts/offline-context";
import { useTheme } from "@/hooks/use-theme";
import type { HabitDashboardItem } from "@/types/habit";
import { TallyMarks } from "@/components/habits/tally-marks";
import { formatFullDate, weekDates } from "@/utils/date";
import { stampFeedback, tapFeedback } from "@/utils/haptics";

function greeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Morning";
  }

  if (hour < 18) {
    return "Afternoon";
  }

  return "Evening";
}

export default function TodayScreen() {
  const { colors } = useTheme();
  const { show } = useToast();
  const { data, error, isLoading, isError, refetch, isRefetching } =
    useDashboard();
  const { data: config } = useAppConfig();
  const checkIn = useCheckIn();
  const { pending, syncing, flush } = useOfflineSyncContext();
  const [logging, setLogging] = useState<HabitDashboardItem | null>(null);

  const habits = data?.today.habits ?? [];
  const done = habits.filter((habit) => habit.is_completed_today).length;
  const loggingHabit = logging
    ? (habits.find((habit) => habit.id === logging.id) ?? logging)
    : null;

  const announce = (result: "synced" | "queued") => {
    stampFeedback();
    show(
      result === "queued"
        ? "Saved on this phone. It will sync when you are back online."
        : "Kept for today.",
      result === "queued" ? "neutral" : "success",
    );
  };

  const complete = (habit: HabitDashboardItem) => {
    tapFeedback();
    checkIn.mutate(
      { habit },
      {
        onSuccess: announce,
        onError: (cause) => show(errorMessage(cause), "danger"),
      },
    );
  };

  const logQuantity = (qty: number) => {
    if (!loggingHabit) {
      return;
    }

    checkIn.mutate(
      { habit: loggingHabit, qty },
      {
        onSuccess: (result) => {
          setLogging(null);
          announce(result);
        },
        onError: (cause) => show(errorMessage(cause), "danger"),
      },
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <BrandMark />
        <View style={styles.hero}>
          <Text variant="display">Today</Text>
          <Text variant="body" color="textMuted">
            Reading the ledger…
          </Text>
        </View>
        <View style={styles.list}>
          <HabitRowSkeleton />
          <Hairline />
          <HabitRowSkeleton />
          <Hairline />
          <HabitRowSkeleton />
        </View>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <BrandMark />
        <View style={styles.hero}>
          <Text variant="display">Today</Text>
        </View>
        <StateBlock
          icon="cloud-offline-outline"
          tone="danger"
          title="The ledger is out of reach"
          body={errorMessage(error)}
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const firstName = data.user.display_name?.split(" ")[0] || "there";

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      <BrandMark />

      <View style={styles.hero}>
        <Text variant="body" color="textMuted">
          {greeting()}, {firstName}
        </Text>
        <View style={styles.titleRow}>
          <Text variant="display">Today</Text>
          <View
            style={[styles.countPill, { borderColor: colors.borderStrong }]}
          >
            <Text variant="numeral" color="accent">
              {done}
            </Text>
            <Text variant="meta" color="textMuted">
              / {habits.length}
            </Text>
          </View>
        </View>
        <Text variant="meta" color="textMuted">
          {formatFullDate(data.today.date)}
        </Text>
      </View>

      <WeekStrip
        dates={weekDates(data.today.date)}
        entries={data.heatmap_entry}
        todayISO={data.today.date}
      />

      {config?.maintenance ? (
        <View
          style={[
            styles.notice,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="construct-outline" size={18} color={colors.accent} />
          <Text variant="meta" color="textMuted" style={styles.noticeText}>
            {config.maintenance_message ||
              "Streakly is in maintenance mode. Some actions may fail."}
          </Text>
        </View>
      ) : null}

      <OfflineBanner
        pending={pending}
        syncing={syncing}
        onSync={() => void flush()}
      />

      <SectionHeader
        title="The ledger"
        trailing={habits.length > 0 ? `${done} kept` : undefined}
      />

      {habits.length === 0 ? (
        <StateBlock
          icon="leaf-outline"
          title="No habits yet"
          body="Start with one small thing you can do every day. The minimum is enough to keep the streak."
          actionLabel="Create a habit"
          onAction={() => router.push("/habit/new")}
        />
      ) : (
        <View>
          {habits.map((habit, index) => (
            <View key={habit.id}>
              {index > 0 ? <Hairline /> : null}
              <HabitRow
                habit={habit}
                busy={
                  checkIn.isPending && checkIn.variables?.habit.id === habit.id
                }
                onOpen={() =>
                  router.push({
                    pathname: "/habit/[id]",
                    params: { id: habit.id },
                  })
                }
                onComplete={() => complete(habit)}
                onLog={() => setLogging(habit)}
              />
            </View>
          ))}
        </View>
      )}

      {habits.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a habit"
          onPress={() => {
            tapFeedback();
            router.push("/habit/new");
          }}
          style={({ pressed }) => [
            styles.addRow,
            {
              borderColor: colors.borderStrong,
              opacity: pressed ? 0.65 : 1,
            },
          ]}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.textMuted}
          />
          <Text variant="label" color="textMuted">
            Add a habit
          </Text>
        </Pressable>
      ) : null}

      {done > 0 ? (
        <View style={styles.footer}>
          <TallyMarks count={done} size={15} />
          <Text variant="meta" color="textMuted">
            {done === 1 ? "One mark" : `${done} marks`} on today&apos;s line
          </Text>
        </View>
      ) : null}

      <LogQuantitySheet
        habit={loggingHabit}
        visible={logging !== null}
        busy={checkIn.isPending}
        onClose={() => setLogging(null)}
        onSubmit={logQuantity}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.four,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
  },
  noticeText: {
    flex: 1,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: Radius.card,
    minHeight: 52,
    marginTop: Spacing.two,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
});

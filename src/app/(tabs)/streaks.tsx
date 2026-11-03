import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { LedgerGrid } from '@/components/habits/ledger-grid';
import { StreakLine } from '@/components/habits/streak-line';
import { TallyMarks } from '@/components/habits/tally-marks';
import { BrandMark } from '@/components/ui/brand-mark';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Hairline, StateBlock } from '@/components/ui/state-block';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';

export default function StreaksScreen() {
  const { colors } = useTheme();
  const { data, error, isLoading, isError, refetch, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <Screen>
        <BrandMark />
        <Text variant="display">Streaks</Text>
        <Skeleton height={150} radius={Radius.card} />
        <Skeleton height={72} radius={Radius.card} />
        <Skeleton height={72} radius={Radius.card} />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <BrandMark />
        <Text variant="display">Streaks</Text>
        <StateBlock
          icon="cloud-offline-outline"
          tone="danger"
          title="Streaks are out of reach"
          body={errorMessage(error)}
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const habits = [...data.today.habits].sort((a, b) => b.current_streak - a.current_streak);
  const best = habits[0]?.current_streak ?? 0;
  const keptDays = data.heatmap_entry.filter((entry) => entry.completed_count > 0).length;
  const totalMarks = habits.reduce((sum, habit) => sum + habit.current_streak, 0);

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }>
      <BrandMark />

      <View style={styles.hero}>
        <Text variant="display">Streaks</Text>
        <Text variant="body" color="textMuted">
          The record of days you kept, not days you were perfect.
        </Text>
      </View>

      <View style={[styles.stats, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Stat label="Best streak" value={best} suffix={best === 1 ? 'day' : 'days'} />
        <View style={[styles.statRule, { backgroundColor: colors.border }]} />
        <Stat label="Days kept" value={keptDays} suffix="total" />
        <View style={[styles.statRule, { backgroundColor: colors.border }]} />
        <Stat label="Freezes" value={data.user.freeze_balance} suffix="left" />
      </View>

      <SectionHeader title="Eight weeks" trailing="kept days shaded" />

      <View style={[styles.gridCard, { borderColor: colors.border }]}>
        <LedgerGrid entries={data.heatmap_entry} todayISO={data.today.date} />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]} />
            <Text variant="micro" color="textFaint">
              none
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colors.accent, opacity: 0.55 }]} />
            <Text variant="micro" color="textFaint">
              some
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colors.accent }]} />
            <Text variant="micro" color="textFaint">
              all
            </Text>
          </View>
        </View>
      </View>

      <SectionHeader title="By habit" trailing={`${totalMarks} marks held`} />

      {habits.length === 0 ? (
        <StateBlock
          icon="flame-outline"
          title="No streaks on the books"
          body="Create a habit and mark it today to open the first tally."
          actionLabel="Create a habit"
          onAction={() => router.push('/habit/new')}
        />
      ) : (
        <View>
          {habits.map((habit, index) => (
            <View key={habit.id}>
              {index > 0 ? <Hairline /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${habit.title}, ${habit.current_streak} day streak`}
                onPress={() =>
                  router.push({ pathname: '/habit/[id]', params: { id: habit.id } })
                }
                style={({ pressed }) => [styles.row, { opacity: pressed ? 0.65 : 1 }]}>
                <View style={styles.rowCopy}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {habit.title}
                  </Text>
                  <StreakLine streak={habit.current_streak} />
                </View>

                <View style={styles.rowMeta}>
                  <TallyMarks count={habit.current_streak} size={12} maxGroups={3} />
                  <Ionicons
                    name={habit.is_completed_today ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={habit.is_completed_today ? colors.positive : colors.textFaint}
                  />
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Text variant="meta" color="textFaint">
        A day counts when you reach the minimum. Freezes protect a missed day when the server grants
        one.
      </Text>
    </Screen>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="numeral">{value}</Text>
      <Text variant="micro" color="textFaint">
        {suffix}
      </Text>
      <Text variant="meta" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.two,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingVertical: Spacing.four,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statRule: {
    width: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
  gridCard: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  rowCopy: {
    flex: 1,
    gap: Spacing.two,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});

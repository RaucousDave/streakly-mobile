import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { archiveHabit, freezeHabit } from '@/api/habits.api';
import { queryKeys } from '@/api/query-keys';
import { LogQuantitySheet } from '@/components/habits/log-quantity-sheet';
import { NotchBar } from '@/components/habits/notch-bar';
import { StampButton } from '@/components/habits/stamp-button';
import { TallyMarks } from '@/components/habits/tally-marks';
import { WeekStrip } from '@/components/habits/week-strip';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Hairline, StateBlock } from '@/components/ui/state-block';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { Radius, Spacing } from '@/constants/theme';
import { useCheckIn } from '@/hooks/use-check-in';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import type { HabitDashboardItem } from '@/types/habit';
import { addDays, formatFullDate, weekDates } from '@/utils/date';
import { stampFeedback, tapFeedback, warnFeedback } from '@/utils/haptics';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { show } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useDashboard();
  const checkIn = useCheckIn();
  const [logging, setLogging] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const habit = data?.today.habits.find((item) => item.id === id) ?? null;
  const today = data?.today.date;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    // Deep links have no in-app history to step back into.
    router.replace('/');
  };

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };

  const freeze = useMutation({
    mutationFn: () => {
      if (!id || !today) {
        throw new Error('The habit is not loaded yet.');
      }

      return freezeHabit(id, addDays(today, -1));
    },
    onSuccess: async () => {
      stampFeedback();
      await refresh();
      show('Yesterday is protected.', 'success');
    },
    onError: (cause) => {
      warnFeedback();
      show(errorMessage(cause), 'danger');
    },
  });

  const archive = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error('The habit is not loaded yet.');
      }

      return archiveHabit(id);
    },
    onSuccess: async () => {
      await refresh();
      show('Habit archived. Its history stays on the server.', 'success');
      goBack();
    },
    onError: (cause) => show(errorMessage(cause), 'danger'),
  });

  const complete = () => {
    if (!habit) {
      return;
    }

    tapFeedback();
    checkIn.mutate(
      { habit },
      {
        onSuccess: (result) => {
          stampFeedback();
          show(result === 'queued' ? 'Saved on this phone.' : 'Kept for today.', 'success');
        },
        onError: (cause) => show(errorMessage(cause), 'danger'),
      }
    );
  };

  const log = (qty: number) => {
    if (!habit) {
      return;
    }

    checkIn.mutate(
      { habit, qty },
      {
        onSuccess: (result) => {
          setLogging(false);
          stampFeedback();
          show(result === 'queued' ? 'Saved on this phone.' : 'Logged for today.', 'success');
        },
        onError: (cause) => show(errorMessage(cause), 'danger'),
      }
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <BackRow onBack={goBack} />
        <Text variant="display">Habit</Text>
        <Text variant="body" color="textMuted">
          Reading the entry…
        </Text>
      </Screen>
    );
  }

  if (!habit || !data) {
    return (
      <Screen>
        <BackRow onBack={goBack} />
        <StateBlock
          icon="help-circle-outline"
          title="This entry is gone"
          body="The habit may have been archived or removed from this account."
          actionLabel="Back to today"
          onAction={goBack}
        />
      </Screen>
    );
  }

  const isQuantity = habit.type === 'QUANTITATIVE';
  const target = habit.target_qty ?? 0;
  const mvt = habit.mvt_qty ?? 0;
  const unit = habit.unit ?? '';
  const busy = checkIn.isPending;

  return (
    <Screen>
      <BackRow onBack={goBack} />

      <View style={styles.hero}>
        <Text variant="micro" color="textFaint">
          {isQuantity ? 'AMOUNT HABIT' : 'DONE-OR-NOT HABIT'}
        </Text>
        <Text variant="display">{habit.title}</Text>
        <Text variant="body" color="textMuted">
          {isQuantity
            ? `${target} ${unit} a day, with ${mvt} ${unit} as the minimum that counts.`
            : 'One check-in closes the day.'}
        </Text>
      </View>

      <View style={[styles.statusCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.statusTop}>
          <View style={styles.statusCopy}>
            <Text variant="micro" color="textFaint">
              TODAY · {formatFullDate(data.today.date)}
            </Text>
            <Text variant="h2" color={habit.is_completed_today ? 'positive' : 'text'}>
              {habit.is_completed_today
                ? isQuantity
                  ? `${habit.qty_achieved_today} ${unit} logged`
                  : 'Kept'
                : 'Still open'}
            </Text>
          </View>

          {isQuantity ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={habit.is_completed_today ? 'Already logged today' : 'Log progress'}
              accessibilityState={{ disabled: habit.is_completed_today || busy }}
              disabled={habit.is_completed_today || busy}
              onPress={() => setLogging(true)}
              style={({ pressed }) => [
                styles.logButton,
                {
                  borderColor: colors.borderStrong,
                  opacity: habit.is_completed_today ? 0.45 : pressed ? 0.7 : 1,
                },
              ]}>
              <Ionicons name="add" size={22} color={colors.text} />
            </Pressable>
          ) : (
            <StampButton
              done={habit.is_completed_today}
              busy={busy}
              label={habit.is_completed_today ? 'Done today' : 'Mark done today'}
              onPress={complete}
            />
          )}
        </View>

        {isQuantity ? (
          <View style={styles.gauge}>
            <NotchBar
              value={habit.qty_achieved_today}
              mvt={mvt}
              target={target}
              label={`${habit.qty_achieved_today} of ${target} ${unit} today`}
            />
            <View style={styles.gaugeLabels}>
              <Text variant="meta" color="textMuted">
                {habit.qty_achieved_today}/{target} {unit}
              </Text>
              <Text variant="meta" color={habit.is_mvt_met_today ? 'positive' : 'textFaint'}>
                minimum {mvt}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.streakCard, { borderColor: colors.border }]}>
        <View style={styles.streakTop}>
          <View>
            <Text variant="micro" color="textFaint">
              CURRENT STREAK
            </Text>
            <Text variant="display">{habit.current_streak}</Text>
          </View>
          <TallyMarks count={habit.current_streak} size={20} maxGroups={6} />
        </View>
        <Text variant="meta" color="textMuted">
          {habit.current_streak === 0
            ? 'Mark today to open the first tally.'
            : `${habit.current_streak} ${habit.current_streak === 1 ? 'day' : 'days'} in a row, counted by the server.`}
        </Text>
      </View>

      <SectionHeader title="This week" trailing="all habits" />
      <WeekStrip
        dates={weekDates(data.today.date)}
        entries={data.heatmap_entry}
        todayISO={data.today.date}
      />

      <SectionHeader title="Protect the chain" />

      <View style={[styles.actionCard, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text variant="bodyStrong">Freeze yesterday</Text>
            <Text variant="meta" color="textMuted">
              Uses one freeze from your balance ({data.user.freeze_balance} left).
            </Text>
          </View>
          <Button
            label="Freeze"
            variant="secondary"
            loading={freeze.isPending}
            disabled={freeze.isPending || data.user.freeze_balance <= 0}
            onPress={() => freeze.mutate()}
          />
        </View>

        <Hairline />

        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text variant="bodyStrong">Archive this habit</Text>
            <Text variant="meta" color="textMuted">
              It leaves the daily list. Past check-ins are kept on the server.
            </Text>
          </View>
          <Button
            label={confirmArchive ? 'Confirm' : 'Archive'}
            variant="danger"
            loading={archive.isPending}
            disabled={archive.isPending}
            onPress={() => {
              if (confirmArchive) {
                archive.mutate();
              } else {
                setConfirmArchive(true);
              }
            }}
          />
        </View>

        {confirmArchive ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel archiving"
            onPress={() => setConfirmArchive(false)}
            hitSlop={6}>
            <Text variant="meta" color="textMuted">
              Tap confirm to archive, or cancel.
            </Text>
          </Pressable>
        ) : null}
      </View>

      <LogQuantitySheet
        habit={habit as HabitDashboardItem}
        visible={logging}
        busy={busy}
        onClose={() => setLogging(false)}
        onSubmit={log}
      />
    </Screen>
  );
}

function BackRow({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={styles.backRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [
          styles.iconButton,
          { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
        ]}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </Pressable>
      <Text variant="micro" color="textFaint">
        ENTRY
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    gap: Spacing.two,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  statusCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  logButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.control,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gauge: {
    gap: Spacing.two,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakCard: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.four,
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
});

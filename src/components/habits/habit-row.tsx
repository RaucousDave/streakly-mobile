import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NotchBar } from '@/components/habits/notch-bar';
import { StampButton } from '@/components/habits/stamp-button';
import { StreakLine } from '@/components/habits/streak-line';
import { Text } from '@/components/ui/text';
import type { HabitDashboardItem } from '@/types/habit';

type HabitRowProps = {
  habit: HabitDashboardItem;
  onOpen: () => void;
  onComplete: () => void;
  onLog: () => void;
  busy?: boolean;
};

export function HabitRow({ habit, onOpen, onComplete, onLog, busy }: HabitRowProps) {
  const { colors } = useTheme();
  const isQuantity = habit.type === 'QUANTITATIVE';
  const target = habit.target_qty ?? 0;
  const mvt = habit.mvt_qty ?? 0;
  const unit = habit.unit ?? '';

  const subtitle = isQuantity
    ? `${target} ${unit} a day · minimum ${mvt}`
    : 'Check in once today';

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${habit.title}. ${subtitle}. Open habit`}
        onPress={onOpen}
        style={({ pressed }) => [styles.main, { opacity: pressed ? 0.7 : 1 }]}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {habit.title}
        </Text>

        <Text variant="meta" color="textMuted">
          {subtitle}
        </Text>

        {isQuantity ? (
          <View style={styles.gauge}>
            <NotchBar
              value={habit.qty_achieved_today}
              mvt={mvt}
              target={target}
              label={`${habit.qty_achieved_today} of ${target} ${unit} logged today`}
            />
            <Text variant="meta" color={habit.is_mvt_met_today ? 'positive' : 'textMuted'}>
              {habit.qty_achieved_today}/{target} {unit}
            </Text>
          </View>
        ) : null}

        <StreakLine streak={habit.current_streak} />
      </Pressable>

      {isQuantity ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            habit.is_completed_today ? `${habit.title} already logged today` : `Log progress for ${habit.title}`
          }
          accessibilityState={{ disabled: habit.is_completed_today || busy }}
          disabled={habit.is_completed_today || busy}
          onPress={onLog}
          hitSlop={6}
          style={({ pressed }) => [
            styles.logButton,
            {
              borderColor: habit.is_completed_today ? colors.border : colors.borderStrong,
              backgroundColor: habit.is_completed_today ? colors.positiveSoft : 'transparent',
              opacity: busy ? 0.5 : pressed ? 0.75 : 1,
            },
          ]}>
          <Ionicons
            name={habit.is_completed_today ? 'checkmark' : 'add'}
            size={22}
            color={habit.is_completed_today ? colors.positive : colors.text}
          />
        </Pressable>
      ) : (
        <StampButton
          done={habit.is_completed_today}
          busy={busy}
          label={
            habit.is_completed_today
              ? `${habit.title} is done today`
              : `Mark ${habit.title} done today`
          }
          onPress={onComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  main: {
    flex: 1,
    gap: Spacing.two,
  },
  gauge: {
    gap: Spacing.one,
    marginTop: Spacing.one,
    paddingRight: Spacing.two,
  },
  logButton: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    borderRadius: Radius.control,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

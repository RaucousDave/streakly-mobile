import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';
import { dayOfMonth, weekdayShort } from '@/utils/date';
import type { HeatmapEntry } from '@/types/habit';

type WeekStripProps = {
  dates: string[];
  entries: HeatmapEntry[];
  todayISO: string;
};

/**
 * The week as a ruled ledger line: one cell per day, filled by how much of
 * that day's habits were kept. Not a calendar grid, not a heat map square.
 */
export function WeekStrip({ dates, entries, todayISO }: WeekStripProps) {
  const { colors } = useTheme();
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));

  return (
    <View style={styles.row} accessibilityRole="summary" accessibilityLabel="This week at a glance">
      {dates.map((date) => {
        const entry = byDate.get(date);
        const ratio = entry && entry.total > 0 ? entry.completed_count / entry.total : 0;
        const isToday = date === todayISO;
        const isFuture = date > todayISO;

        return (
          <View key={date} style={styles.cell}>
            <Text variant="micro" color={isToday ? 'text' : 'textFaint'} align="center">
              {weekdayShort(date).slice(0, 1)}
            </Text>

            <View
              style={[
                styles.mark,
                {
                  borderColor: isToday ? colors.text : colors.border,
                  borderWidth: isToday ? 1.5 : 1,
                  backgroundColor:
                    ratio > 0 ? colors.accent : isFuture ? 'transparent' : colors.surfaceSunken,
                  opacity: ratio > 0 ? 0.35 + ratio * 0.65 : 1,
                },
              ]}
            />

            <Text variant="micro" color="textFaint" align="center">
              {dayOfMonth(date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  mark: {
    width: '100%',
    height: 26,
    borderRadius: Radius.mark,
  },
});

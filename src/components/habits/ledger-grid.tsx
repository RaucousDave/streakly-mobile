import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';
import type { HeatmapEntry } from '@/types/habit';
import { addDays, dayOfMonth, parseISODate, weekDates } from '@/utils/date';

const WEEKS = 8;
const CELL = 20;

/**
 * Eight weeks of the ledger, one column per week and one row per weekday.
 * Filled by how much of that day was kept, outlined on today.
 */
export function LedgerGrid({ entries, todayISO }: { entries: HeatmapEntry[]; todayISO: string }) {
  const { colors } = useTheme();
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));

  const currentWeek = weekDates(todayISO);
  const weeks = Array.from({ length: WEEKS }, (_, index) =>
    currentWeek.map((date) => addDays(date, (index - (WEEKS - 1)) * 7))
  );

  const weekdayLabels = currentWeek.map((date) =>
    new Intl.DateTimeFormat('en-GB', { weekday: 'narrow', timeZone: 'UTC' }).format(
      parseISODate(date)
    )
  );

  return (
    <View style={styles.root} accessibilityRole="image" accessibilityLabel="Eight weeks of kept days">
      <View style={styles.body}>
        <View style={styles.labels}>
          {weekdayLabels.map((label, index) => (
            <Text key={`${label}-${index}`} variant="micro" color="textFaint" style={styles.label}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {weeks.map((week) => (
            <View key={week[0]} style={styles.column}>
              {week.map((date) => {
                const entry = byDate.get(date);
                const ratio = entry && entry.total > 0 ? entry.completed_count / entry.total : 0;
                const isToday = date === todayISO;
                const isFuture = date > todayISO;

                return (
                  <View
                    key={date}
                    style={[
                      styles.cell,
                      {
                        borderColor: isToday ? colors.text : colors.border,
                        borderWidth: isToday ? 1.5 : StyleSheet.hairlineWidth,
                        backgroundColor: isFuture
                          ? 'transparent'
                          : ratio > 0
                            ? colors.accent
                            : colors.surfaceSunken,
                        opacity: isFuture ? 0.35 : ratio > 0 ? 0.3 + ratio * 0.7 : 1,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.axis}>
        <Text variant="micro" color="textFaint">
          {dayOfMonth(weeks[0][0])} {monthShort(weeks[0][0])}
        </Text>
        <Text variant="micro" color="textFaint">
          {dayOfMonth(todayISO)} {monthShort(todayISO)}
        </Text>
      </View>
    </View>
  );
}

function monthShort(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(
    parseISODate(iso)
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  body: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  labels: {
    gap: Spacing.one,
  },
  label: {
    width: 16,
    height: CELL,
    lineHeight: CELL,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  column: {
    gap: Spacing.one,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: Radius.mark,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
  },
});

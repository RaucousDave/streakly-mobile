import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TallyMarks } from '@/components/habits/tally-marks';

/**
 * The tally is the Streakly mark: five strokes kept together as one small
 * ledger stamp. It stays legible in both the app chrome and compact states.
 */
export function BrandMark({ tally = 5 }: { tally?: number }) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.mark, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="header"
      accessibilityLabel="Streakly"
    >
      <TallyMarks count={tally || 5} size={20} maxGroups={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignSelf: 'flex-start',
    minWidth: 48,
    height: 40,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

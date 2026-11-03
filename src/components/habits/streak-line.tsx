import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { TallyMarks } from '@/components/habits/tally-marks';
import { Text } from '@/components/ui/text';

export function StreakLine({ streak, size = 13 }: { streak: number; size?: number }) {
  if (streak <= 0) {
    return (
      <Text variant="meta" color="textFaint">
        No streak yet
      </Text>
    );
  }

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={`${streak} day streak`}>
      <TallyMarks count={streak} size={size} />
      <Text variant="meta" color="textMuted">
        {streak} {streak === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
});

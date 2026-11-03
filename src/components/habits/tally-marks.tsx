import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type TallyMarksProps = {
  count: number;
  size?: number;
  color?: string;
  maxGroups?: number;
};

/**
 * The signature mark: streaks are drawn, not printed. Each group of five is
 * four upright strokes closed by a diagonal, the way a tally is kept on paper.
 */
export function TallyMarks({ count, size = 14, color, maxGroups = 5 }: TallyMarksProps) {
  const { colors } = useTheme();
  const ink = color ?? colors.accent;

  if (count <= 0) {
    return null;
  }

  const groups = Math.min(Math.ceil(count / 5), maxGroups);
  const barWidth = Math.max(2, Math.round(size * 0.13));
  const gap = Math.max(2, Math.round(size * 0.15));
  const groupWidth = barWidth * 4 + gap * 3;

  return (
    <View style={[styles.row, { gap: Math.round(gap * 1.6) }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: groups }, (_, groupIndex) => {
        const remaining = count - groupIndex * 5;
        const strokes = Math.min(remaining, 5);
        const complete = strokes === 5;

        return (
          <View key={groupIndex} style={{ width: groupWidth, height: size }}>
            {Array.from({ length: Math.min(strokes, 4) }, (_, strokeIndex) => (
              <View
                key={strokeIndex}
                style={{
                  position: 'absolute',
                  left: strokeIndex * (barWidth + gap),
                  top: 0,
                  width: barWidth,
                  height: size,
                  borderRadius: barWidth / 2,
                  backgroundColor: ink,
                  transform: [{ rotate: strokeIndex % 2 === 0 ? '-1.5deg' : '1deg' }],
                }}
              />
            ))}

            {complete ? (
              <View
                style={{
                  position: 'absolute',
                  left: -2,
                  top: size / 2 - barWidth / 2,
                  width: groupWidth + 4,
                  height: barWidth,
                  borderRadius: barWidth / 2,
                  backgroundColor: ink,
                  transform: [{ rotate: '-34deg' }],
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

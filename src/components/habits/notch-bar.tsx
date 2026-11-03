import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type NotchBarProps = {
  value: number;
  mvt: number;
  target: number;
  label: string;
};

/**
 * A ruled gauge instead of a ring: the fill shows what has been logged, the
 * ink tick marks the minimum that still counts. The minimum is the point of
 * the product, so it gets a physical mark on the rule.
 */
export function NotchBar({ value, mvt, target, label }: NotchBarProps) {
  const { colors } = useTheme();
  const safeTarget = Math.max(target, 1);
  const ratio = Math.min(Math.max(value / safeTarget, 0), 1);
  const mvtRatio = Math.min(Math.max(mvt / safeTarget, 0), 1);
  const mvtMet = value >= mvt;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: safeTarget, now: Math.min(value, safeTarget) }}
      style={[styles.track, { backgroundColor: colors.surfaceSunken }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${ratio * 100}%`,
            backgroundColor: mvtMet ? colors.positive : colors.accent,
          },
        ]}
      />

      <View
        style={[
          styles.tick,
          {
            left: `${mvtRatio * 100}%`,
            backgroundColor: mvtMet ? colors.positive : colors.textMuted,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'visible',
    justifyContent: 'center',
  },
  fill: {
    height: 6,
    borderRadius: Radius.pill,
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 12,
    borderRadius: 1,
    top: -3,
    marginLeft: Spacing.one,
  },
});

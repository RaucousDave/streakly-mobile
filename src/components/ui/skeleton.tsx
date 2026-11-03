import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Skeleton({ height = 16, width = '100%', radius = Radius.mark, style }: {
  height?: number;
  width?: ViewStyle['width'];
  radius?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0.85);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { height, width, borderRadius: radius, backgroundColor: colors.skeleton, opacity: pulse },
        style,
      ]}
    />
  );
}

export function HabitRowSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Skeleton height={15} width="58%" />
        <Skeleton height={11} width="34%" />
      </View>
      <Skeleton height={44} width={44} radius={Radius.pill} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  left: {
    flex: 1,
    gap: Spacing.two,
  },
});

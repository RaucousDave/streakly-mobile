import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Layout, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StampButtonProps = {
  done: boolean;
  busy?: boolean;
  label: string;
  onPress: () => void;
};

/**
 * Completing a habit is a stamp, not a checkbox: the mark lands with a short
 * press and a haptic, then stays put for the rest of the day.
 */
export function StampButton({ done, busy, label, onPress }: StampButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));

  const handlePress = () => {
    if (!reduceMotion) {
      scale.setValue(1.16);
      Animated.spring(scale, {
        toValue: 1,
        damping: 9,
        stiffness: 220,
        mass: 0.6,
        useNativeDriver: true,
      }).start();
    }

    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: done || busy, checked: done }}
        disabled={done || busy}
        onPress={handlePress}
        hitSlop={6}
        style={({ pressed }) => [
          styles.stamp,
          {
            borderColor: done ? colors.primary : colors.borderStrong,
            backgroundColor: done ? colors.primary : 'transparent',
            opacity: busy ? 0.5 : pressed ? 0.75 : 1,
          },
        ]}>
        {done ? (
          <Ionicons name="checkmark" size={22} color={colors.onPrimary} />
        ) : (
          <Animated.View
            style={{
              width: 16,
              height: 16,
              borderRadius: Radius.pill,
              borderWidth: 1.5,
              borderColor: colors.textFaint,
            }}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

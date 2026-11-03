import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const background: Record<Variant, string> = {
    primary: colors.primary,
    secondary: 'transparent',
    ghost: 'transparent',
    danger: colors.dangerSoft,
  };

  const labelColor: Record<Variant, ThemeColor> = {
    primary: 'onPrimary',
    secondary: 'text',
    ghost: 'textMuted',
    danger: 'danger',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        {
          backgroundColor: background[variant],
          borderColor: variant === 'secondary' ? colors.borderStrong : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: isDisabled ? 0.45 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        fullWidth ? styles.fullWidth : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors[labelColor[variant]]} />
      ) : (
        <Text variant="button" color={labelColor[variant]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.five,
  },
  md: {
    minHeight: 44,
    paddingVertical: Spacing.three,
  },
  lg: {
    minHeight: 52,
    paddingVertical: Spacing.four,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});

export function InlineAction({
  label,
  onPress,
  color = 'textMuted',
}: {
  label: string;
  onPress: () => void;
  color?: ThemeColor;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [inlineStyles.inline, { opacity: pressed ? 0.6 : 1 }]}>
      <Text variant="label" color={color}>
        {label}
      </Text>
    </Pressable>
  );
}

const inlineStyles = StyleSheet.create({
  inline: {
    minHeight: 32,
    justifyContent: 'center',
  },
});

export const inlineActionStyles = inlineStyles;

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[rowStyles.row, style]}>{children}</View>;
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});

import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';

export type FieldProps = TextInputProps & {
  label: string;
  helper?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
};

export function Field({
  label,
  helper,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...rest
}: FieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.focus : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>

      <TextInput
        {...rest}
        accessibilityLabel={label}
        placeholderTextColor={colors.textFaint}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          Type.body,
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surfaceSunken,
            borderColor,
          },
          style,
        ]}
      />

      {error ? (
        <Text variant="meta" color="danger">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="meta" color="textFaint">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.control,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});

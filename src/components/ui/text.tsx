import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { Type, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextVariant = keyof typeof Type;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: ThemeColor;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const { colors } = useTheme();

  return (
    <RNText
      {...rest}
      style={[Type[variant], { color: colors[color] }, align ? { textAlign: align } : null, style]}
    />
  );
}

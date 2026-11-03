import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type StateBlockProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
};

export function StateBlock({ icon, title, body, actionLabel, onAction, tone = 'neutral' }: StateBlockProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: tone === 'danger' ? colors.dangerSoft : colors.accentSoft }]}>
        <Ionicons name={icon} size={20} color={tone === 'danger' ? colors.danger : colors.accent} />
      </View>

      <View style={styles.copy}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="meta" color="textMuted">
          {body}
        </Text>
      </View>

      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="md" />
      ) : null}
    </View>
  );
}

export function Hairline({ style }: { style?: object }) {
  const { colors } = useTheme();

  return <View style={[styles.hairline, { backgroundColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.five,
    gap: Spacing.four,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: Spacing.one,
    maxWidth: Layout.maxContentWidth,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});

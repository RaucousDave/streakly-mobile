import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';

export function SectionHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text variant="h2">{title}</Text>
      {trailing ? (
        <Text variant="meta" color="textMuted">
          {trailing}
        </Text>
      ) : null}
      <View style={[styles.rule, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.three,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.one,
  },
});

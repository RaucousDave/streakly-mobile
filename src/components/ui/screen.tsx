import {
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  bottomInset?: number;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

/**
 * Native tabs already reserve the bottom inset on Android, so screens only
 * claim the top edge and centre themselves on wide web previews.
 */
export function Screen({
  children,
  scroll = true,
  contentStyle,
  bottomInset = Spacing.seven,
  refreshControl,
}: ScreenProps) {
  const { colors } = useTheme();

  const content = [
    styles.content,
    { paddingBottom: bottomInset },
    contentStyle,
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={content}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.root, styles.column, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.four,
  },
  column: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
});

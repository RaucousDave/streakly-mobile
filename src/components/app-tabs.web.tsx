import { Ionicons } from '@expo/vector-icons';
import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';

/**
 * The browser preview gets the same three destinations in a bottom bar so the
 * layout matches the phone rather than becoming a desktop sidebar.
 */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="today" href="/" asChild>
            <TabButton icon="today" label="Today" />
          </TabTrigger>
          <TabTrigger name="streaks" href="/streaks" asChild>
            <TabButton icon="flame" label="Streaks" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="person" label="Profile" />
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar(props: TabListProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}>
      <View style={styles.barInner}>{props.children}</View>
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function TabButton({ icon, label, isFocused, onPress, onLongPress }: TabButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.65 : 1 }]}>
      <Ionicons
        name={isFocused ? icon : (`${icon}-outline` as keyof typeof Ionicons.glyphMap)}
        size={21}
        color={isFocused ? colors.accent : colors.textMuted}
      />
      <Text variant="micro" color={isFocused ? 'accent' : 'textMuted'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  barInner: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    minHeight: Layout.hitTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { NativeTabs } from 'expo-router/native-tabs';

import { Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Android keeps the platform tab bar: it respects gesture navigation, haptics
 * and the system font scale. The icons and colours are the only customisation.
 */
export default function AppTabs() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      iconColor={{ default: colors.textMuted, selected: colors.accent }}
      tintColor={colors.accent}
      labelStyle={{
        default: { ...Type.micro, color: colors.textMuted },
        selected: { ...Type.micro, color: colors.accent },
      }}
      indicatorColor={colors.accentSoft}
      rippleColor={colors.surfaceSunken}
      labelVisibilityMode="labeled">
      <NativeTabs.Trigger name="index" accessibilityLabel="Today">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="today-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="today" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="streaks" accessibilityLabel="Streaks">
        <NativeTabs.Trigger.Label>Streaks</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="flame-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="flame" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" accessibilityLabel="Profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="person-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="person" />,
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

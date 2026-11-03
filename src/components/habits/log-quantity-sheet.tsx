import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import type { HabitDashboardItem } from '@/types/habit';

type LogQuantitySheetProps = {
  habit: HabitDashboardItem | null;
  visible: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (qty: number) => void;
};

export function LogQuantitySheet({ habit, visible, busy, onClose, onSubmit }: LogQuantitySheetProps) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={habit?.title ?? 'Log progress'}
      description="One entry per day. Log what you actually did, even if it is only the minimum.">
      {habit ? (
        <QuantityForm
          key={`${habit.id}-${visible ? 'open' : 'closed'}`}
          habit={habit}
          busy={busy}
          onSubmit={onSubmit}
        />
      ) : null}
    </Sheet>
  );
}

function QuantityForm({
  habit,
  busy,
  onSubmit,
}: {
  habit: HabitDashboardItem;
  busy?: boolean;
  onSubmit: (qty: number) => void;
}) {
  const { colors } = useTheme();
  const target = habit.target_qty ?? 1;
  const mvt = habit.mvt_qty ?? 1;
  const unit = habit.unit ?? '';
  const [value, setValue] = useState(mvt);

  const step = (delta: number) =>
    setValue((current) => Math.max(0, Math.min(current + delta, target * 2)));

  return (
    <>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease"
          onPress={() => step(-1)}
          style={({ pressed }) => [
            styles.stepButton,
            { borderColor: colors.borderStrong, opacity: pressed ? 0.6 : 1 },
          ]}>
          <Ionicons name="remove" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.value}>
          <Text variant="display">{value}</Text>
          <Text variant="meta" color="textMuted">
            of {target} {unit}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase"
          onPress={() => step(1)}
          style={({ pressed }) => [
            styles.stepButton,
            { borderColor: colors.borderStrong, opacity: pressed ? 0.6 : 1 },
          ]}>
          <Ionicons name="add" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.chips}>
        <Chip label={`Minimum · ${mvt}`} active={value === mvt} onPress={() => setValue(mvt)} />
        <Chip label={`Full · ${target}`} active={value === target} onPress={() => setValue(target)} />
      </View>

      <Button
        label={`Log ${value} ${unit}`.trim()}
        onPress={() => onSubmit(value)}
        loading={busy}
        disabled={value <= 0}
        size="lg"
        fullWidth
      />
    </>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: active ? colors.text : colors.border,
          backgroundColor: active ? colors.surfaceSunken : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Text variant="label" color={active ? 'text' : 'textMuted'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  stepButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.control,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
});

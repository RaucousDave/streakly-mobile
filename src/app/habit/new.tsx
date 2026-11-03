import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { createHabit } from '@/api/habits.api';
import { queryKeys } from '@/api/query-keys';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { HabitType } from '@/types/habit';
import { tapFeedback, stampFeedback } from '@/utils/haptics';

export default function NewHabitScreen() {
  const { colors } = useTheme();
  const { show } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>('BOOLEAN');
  const [target, setTarget] = useState('30');
  const [mvt, setMvt] = useState('10');
  const [unit, setUnit] = useState('minutes');
  const [error, setError] = useState<string | null>(null);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  const create = useMutation({
    mutationFn: createHabit,
    onSuccess: async () => {
      stampFeedback();
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      await queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      show('Habit added to the ledger.', 'success');
      goBack();
    },
    onError: (cause) => show(errorMessage(cause), 'danger'),
  });

  const submit = () => {
    setError(null);

    if (title.trim().length < 2) {
      setError('Give the habit a name.');
      return;
    }

    if (type === 'BOOLEAN') {
      create.mutate({ title: title.trim(), type, target_qty: null, mvt_qty: null, unit: null });
      return;
    }

    const targetQty = Number(target);
    const mvtQty = Number(mvt);

    if (!Number.isFinite(targetQty) || targetQty < 1) {
      setError('The daily target must be at least 1.');
      return;
    }

    if (!Number.isFinite(mvtQty) || mvtQty < 1) {
      setError('The minimum must be at least 1.');
      return;
    }

    if (mvtQty > targetQty) {
      setError('The minimum cannot be higher than the target.');
      return;
    }

    create.mutate({
      title: title.trim(),
      type,
      target_qty: Math.round(targetQty),
      mvt_qty: Math.round(mvtQty),
      unit: unit.trim() || null,
    });
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={goBack}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconButton,
            { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
          ]}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.topCopy}>
          <Text variant="micro" color="textFaint">
            NEW ENTRY
          </Text>
          <Text variant="h1">A habit for the ledger</Text>
        </View>
      </View>

      <Field
        label="Habit"
        value={title}
        onChangeText={setTitle}
        placeholder="Read, walk, practise…"
        autoFocus
        returnKeyType="next"
        maxLength={80}
      />

      <View style={styles.typeGroup}>
        <Text variant="label" color="textMuted">
          How is it counted?
        </Text>

        <View style={styles.typeRow}>
          <TypeOption
            active={type === 'BOOLEAN'}
            icon="checkmark-circle-outline"
            title="Done or not"
            body="One tap closes the day."
            onPress={() => setType('BOOLEAN')}
          />
          <TypeOption
            active={type === 'QUANTITATIVE'}
            icon="stats-chart-outline"
            title="An amount"
            body="Log once with the quantity."
            onPress={() => setType('QUANTITATIVE')}
          />
        </View>
      </View>

      {type === 'QUANTITATIVE' ? (
        <View style={[styles.quantityCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.quantityRow}>
            <Field
              label="Daily target"
              value={target}
              onChangeText={setTarget}
              keyboardType="number-pad"
              containerStyle={styles.quantityField}
              maxLength={5}
            />
            <Field
              label="Minimum"
              value={mvt}
              onChangeText={setMvt}
              keyboardType="number-pad"
              containerStyle={styles.quantityField}
              maxLength={5}
            />
          </View>

          <Field
            label="Unit"
            value={unit}
            onChangeText={setUnit}
            placeholder="minutes, pages, glasses"
            maxLength={24}
          />

          <View style={styles.hintRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text variant="meta" color="textMuted" style={styles.hintText}>
              The minimum is the smallest version that still counts. Keep it well below the target
              so a bad day does not break the chain.
            </Text>
          </View>
        </View>
      ) : null}

      {error ? (
        <Text variant="meta" color="danger">
          {error}
        </Text>
      ) : null}

      <Button
        label="Add habit"
        onPress={() => {
          tapFeedback();
          submit();
        }}
        loading={create.isPending}
        disabled={create.isPending}
        size="lg"
        fullWidth
      />

      <Text variant="meta" color="textFaint" align="center">
        You can log a habit once a day. The server keeps one entry per habit per date.
      </Text>
    </Screen>
  );
}

function TypeOption({
  active,
  icon,
  title,
  body,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.typeOption,
        {
          borderColor: active ? colors.text : colors.border,
          backgroundColor: active ? colors.surface : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Ionicons name={icon} size={20} color={active ? colors.accent : colors.textMuted} />
      <Text variant="bodyStrong" color={active ? 'text' : 'textMuted'}>
        {title}
      </Text>
      <Text variant="meta" color="textFaint">
        {body}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    flex: 1,
    gap: 2,
  },
  typeGroup: {
    gap: Spacing.three,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  typeOption: {
    flex: 1,
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
  },
  quantityCard: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  quantityField: {
    flex: 1,
  },
  hintRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  hintText: {
    flex: 1,
  },
});

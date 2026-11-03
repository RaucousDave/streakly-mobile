import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Motion } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/text';

type Tone = 'neutral' | 'success' | 'danger';

type ToastMessage = { id: number; message: string; tone: Tone };

type ToastContextValue = {
  show: (message: string, tone?: Tone) => void;
};

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, tone: Tone = 'neutral') => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    setToast({ id: Date.now(), message, tone });
    timer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastBubble key={toast.id} toast={toast} /> : null}
    </ToastContext.Provider>
  );
}

function ToastBubble({ toast }: { toast: ToastMessage }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: Motion.quick,
      easing: Easing.bezier(...Motion.easing),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const toneColor = toast.tone === 'danger' ? colors.danger : toast.tone === 'success' ? colors.positive : colors.text;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, Spacing.four) + Spacing.seven,
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}>
      <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
        <View style={[styles.dot, { backgroundColor: toneColor }]} />
        <Text variant="label" style={styles.text}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.five,
    right: Spacing.five,
    alignItems: 'center',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.card,
    borderWidth: 1,
    maxWidth: 480,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },
  text: {
    flexShrink: 1,
  },
});

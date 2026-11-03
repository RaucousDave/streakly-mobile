import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribe = () => () => {};

/**
 * The first web render happens on the server, where the colour scheme is not
 * known. Reporting light until hydration keeps the markup stable; after that
 * the real system preference takes over.
 */
export function useColorScheme() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const colorScheme = useRNColorScheme();

  return hydrated ? colorScheme : 'light';
}

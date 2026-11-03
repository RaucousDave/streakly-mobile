import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Colors, type ColorScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { secureStore } from '@/storage/secure-store';

const THEME_KEY = 'streakly.theme';
type ThemePreference = 'light' | 'dark';

const ThemePreferenceContext = createContext<{
  preference: ThemePreference;
  toggle: () => void;
} | null>(null);

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    void secureStore.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setPreference(saved);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      preference,
      toggle: () => {
        setPreference((current) => {
          const next = current === 'dark' ? 'light' : 'dark';
          void secureStore.setItem(THEME_KEY, next);
          return next;
        });
      },
    }),
    [preference]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useTheme() {
  const preference = useContext(ThemePreferenceContext);
  const scheme = (preference?.preference ?? useColorScheme() ?? 'light') as ColorScheme;
  const resolved: ColorScheme = scheme === 'dark' ? 'dark' : 'light';

  return {
    scheme: resolved,
    colors: Colors[resolved],
    isDark: resolved === 'dark',
    toggleDarkMode: preference?.toggle ?? (() => {}),
  };
}

export function useThemeColors() {
  return useTheme().colors;
}

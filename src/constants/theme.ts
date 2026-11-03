/**
 * Streakly design tokens.
 *
 * The visual world: a market ledger book. Ruled paper, blue-black ink,
 * amber for heat, green for the minimum kept. Depth comes from hairlines
 * and ink, not from shadows or gradients.
 */

import { Platform, type TextStyle } from 'react-native';

export const Colors = {
  light: {
    background: '#F1F3EE',
    surface: '#FBFBF6',
    surfaceSunken: '#E7EAE1',
    border: 'rgba(18, 27, 36, 0.12)',
    borderStrong: 'rgba(18, 27, 36, 0.26)',
    text: '#121B24',
    textMuted: '#5A6673',
    textFaint: '#8C97A2',
    primary: '#121B24',
    onPrimary: '#F7F8F3',
    accent: '#B96C10',
    accentSoft: 'rgba(185, 108, 16, 0.14)',
    positive: '#2C6E52',
    positiveSoft: 'rgba(44, 110, 82, 0.14)',
    danger: '#A82A1E',
    dangerSoft: 'rgba(168, 42, 30, 0.12)',
    focus: '#2C5FA8',
    overlay: 'rgba(18, 27, 36, 0.45)',
    skeleton: 'rgba(18, 27, 36, 0.07)',
  },
  dark: {
    background: '#0E141A',
    surface: '#161E26',
    surfaceSunken: '#090E13',
    border: 'rgba(240, 244, 238, 0.12)',
    borderStrong: 'rgba(240, 244, 238, 0.24)',
    text: '#EDF1EA',
    textMuted: '#A3AEB8',
    textFaint: '#77838E',
    primary: '#EDF1EA',
    onPrimary: '#101820',
    accent: '#E9A23F',
    accentSoft: 'rgba(233, 162, 63, 0.16)',
    positive: '#5AAE86',
    positiveSoft: 'rgba(90, 174, 134, 0.16)',
    danger: '#E4735F',
    dangerSoft: 'rgba(228, 115, 95, 0.14)',
    focus: '#7FA9E8',
    overlay: 'rgba(0, 0, 0, 0.62)',
    skeleton: 'rgba(240, 244, 238, 0.08)',
  },
} as const;

export type ThemeColors = (typeof Colors)['light'];
export type ThemeColor = keyof ThemeColors;
export type ColorScheme = keyof typeof Colors;

export const FontFamily = {
  display: 'BricolageGrotesque_700Bold',
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  text: 'Archivo_400Regular',
  textMedium: 'Archivo_500Medium',
  textSemiBold: 'Archivo_600SemiBold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace', web: 'monospace' }),
} as const;

/**
 * Type scale, ratio ~1.25 from a 15px body. Numerals are tabular so
 * streak counts never shift the layout as they grow.
 */
export const Type = {
  display: {
    fontFamily: FontFamily.displayHeavy,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -1.4,
    fontVariant: ['tabular-nums'],
  },
  numeral: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  h1: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: FontFamily.display,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: FontFamily.text,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: FontFamily.textSemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: FontFamily.textMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    fontFamily: FontFamily.text,
    fontSize: 12,
    lineHeight: 17,
    fontVariant: ['tabular-nums'],
  },
  micro: {
    fontFamily: FontFamily.textSemiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  button: {
    fontFamily: FontFamily.textSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
} satisfies Record<string, TextStyle>;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 56,
} as const;

export const Radius = {
  mark: 5,
  control: 10,
  card: 14,
  sheet: 22,
  pill: 999,
} as const;

export const Layout = {
  screenPadding: 20,
  maxContentWidth: 560,
  tabBarHeight: 64,
  hitTarget: 44,
  hairline: Platform.OS === 'web' ? 1 : 0.75,
} as const;

export const Motion = {
  press: 120,
  quick: 180,
  sheet: 240,
  stamp: 320,
  easing: [0.23, 1, 0.32, 1] as const,
} as const;

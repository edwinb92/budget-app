import { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;

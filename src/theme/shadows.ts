import { Platform, ViewStyle } from 'react-native';

const make = (
  iosShadow: ViewStyle,
  androidElevation: number,
): ViewStyle =>
  Platform.select({
    ios: iosShadow,
    android: { elevation: androidElevation },
    default: iosShadow,
  }) ?? {};

export const shadows = {
  none: {} as ViewStyle,
  card: make(
    {
      shadowColor: '#1F2230',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    2,
  ),
  floating: make(
    {
      shadowColor: '#1F2230',
      shadowOpacity: 0.18,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
    },
    8,
  ),
} as const;

export type ShadowKey = keyof typeof shadows;

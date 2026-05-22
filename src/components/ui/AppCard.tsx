import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

type Variant = 'surface' | 'tint' | 'outline';

interface AppCardProps {
  children: React.ReactNode;
  variant?: Variant;
  tint?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'surface',
  tint,
  onPress,
  style,
  padded = true,
}) => {
  const variantStyle: ViewStyle =
    variant === 'tint'
      ? { backgroundColor: tint ?? colors.surfaceAlt, borderWidth: 0 }
      : variant === 'outline'
      ? { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 }
      : { backgroundColor: colors.surface, borderWidth: 0 };

  const content = (
    <View
      style={[
        styles.base,
        variant === 'surface' && shadows.card,
        variantStyle,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.04)' }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
});

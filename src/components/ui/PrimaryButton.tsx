import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'ghost';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = true,
}) => {
  const isPrimary = variant === 'primary';
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        isPrimary ? styles.primary : styles.ghost,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <View style={styles.row}>
          {Icon ? (
            <Icon
              size={18}
              color={isPrimary ? colors.onPrimary : colors.primary}
              strokeWidth={2.4}
            />
          ) : null}
          <Text
            style={[
              styles.label,
              { color: isPrimary ? colors.onPrimary : colors.primary },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.subtitle,
  },
});

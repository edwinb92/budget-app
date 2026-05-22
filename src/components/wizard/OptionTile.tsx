import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { AccentName, colors, radius, shadows, spacing, typography } from '@/theme';

interface OptionTileProps {
  label: string;
  accent: AccentName;
  icon?: LucideIcon;
  initial?: string;
  selected: boolean;
  onPress: () => void;
}

export const OptionTile: React.FC<OptionTileProps> = ({
  label,
  accent,
  icon: Icon,
  initial,
  selected,
  onPress,
}) => {
  const accentColor = colors.accents[accent];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        shadows.card,
        selected && {
          borderColor: accentColor.base,
          backgroundColor: accentColor.soft,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentColor.soft }]}>
        {Icon ? (
          <Icon size={22} color={accentColor.base} strokeWidth={2.2} />
        ) : (
          <Text style={[styles.initial, { color: accentColor.base }]}>
            {initial}
          </Text>
        )}
      </View>
      <Text
        style={[styles.label, selected && { color: colors.text.primary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 108,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  initial: {
    ...typography.subtitle,
    fontWeight: '700',
    fontSize: 20,
  },
  label: {
    ...typography.body,
    color: colors.text.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, spacing, typography } from '@/theme';

interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onPress: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon: Icon,
  active,
  onPress,
}) => {
  const color = active ? colors.primary : colors.text.faint;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <View style={styles.inner}>
        <Icon size={22} color={color} strokeWidth={active ? 2.6 : 2.2} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  inner: {
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
});

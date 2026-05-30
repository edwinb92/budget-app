import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { colors, radius, spacing, typography } from '@/theme';

interface QuickAmountChipProps {
  value: number;
  selected: boolean;
  onPress: (value: number) => void;
}

export const QuickAmountChip: React.FC<QuickAmountChipProps> = ({
  value,
  selected,
  onPress,
}) => {
  const formatMoney = useFormatCurrency();
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {formatMoney(value)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.body,
    color: colors.text.muted,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface BudgetInputProps {
  value: number;
  onChange: (next: number) => void;
}

const sanitize = (input: string): number => {
  const digits = input.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const BudgetInput: React.FC<BudgetInputProps> = ({ value, onChange }) => {
  const formatted = value === 0 ? '' : value.toLocaleString('en-US');

  return (
    <View style={styles.wrap}>
      <Text style={styles.currency}>$</Text>
      <TextInput
        value={formatted}
        onChangeText={(text) => onChange(sanitize(text))}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.text.faint}
        style={styles.input}
        selectionColor={colors.primary}
        maxLength={9}
      />
      <Text style={styles.suffix}>/ month</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  currency: {
    ...typography.title,
    color: colors.text.muted,
  },
  input: {
    ...typography.title,
    color: colors.text.primary,
    flex: 1,
    padding: 0,
  },
  suffix: {
    ...typography.caption,
    color: colors.text.faint,
    fontWeight: '600',
  },
});

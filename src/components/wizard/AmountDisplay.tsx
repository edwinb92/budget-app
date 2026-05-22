import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface AmountDisplayProps {
  value: number;
  onChange: (next: number) => void;
}

const sanitize = (input: string): number => {
  const digits = input.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  value,
  onChange,
}) => {
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
        autoFocus
        selectionColor={colors.primary}
        maxLength={9}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  currency: {
    ...typography.display,
    color: colors.text.muted,
    marginRight: spacing.sm,
    fontSize: 36,
  },
  input: {
    ...typography.display,
    color: colors.text.primary,
    fontSize: 56,
    lineHeight: 64,
    minWidth: 80,
    textAlign: 'center',
    padding: 0,
  },
});

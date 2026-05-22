import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ExpenseRow } from '@/components/activity/ExpenseRow';
import { colors, spacing, typography } from '@/theme';
import type { Expense } from '@/types';
import { formatCurrency } from '@/utils/format';

interface DayGroupProps {
  label: string;
  items: Expense[];
}

export const DayGroup: React.FC<DayGroupProps> = ({ label, items }) => {
  const total = items.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>

      {items.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  label: {
    ...typography.overline,
    color: colors.text.muted,
  },
  total: {
    ...typography.caption,
    color: colors.text.faint,
    fontWeight: '700',
  },
});

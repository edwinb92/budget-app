import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActivityEmptyState, DayGroup } from '@/components/activity';
import { ScreenContainer } from '@/components/ui';
import { useBudgetStore } from '@/store/budgetStore';
import { colors, spacing, typography } from '@/theme';
import { formatCurrency } from '@/utils/format';
import { groupByDay } from '@/utils/date';

export const ActivityFeedScreen: React.FC = () => {
  const expenses = useBudgetStore((s) => s.expenses);

  const groups = useMemo(() => groupByDay(expenses), [expenses]);
  const totalThisMonth = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>
          {expenses.length === 0
            ? 'Nothing here yet.'
            : `${expenses.length} ${
                expenses.length === 1 ? 'expense' : 'expenses'
              } · ${formatCurrency(totalThisMonth)}`}
        </Text>
      </View>

      {expenses.length === 0 ? (
        <ActivityEmptyState />
      ) : (
        groups.map((group) => (
          <DayGroup
            key={group.dayKey}
            label={group.label}
            items={group.items}
          />
        ))
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
});

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActivityEmptyState, DayGroup } from '@/components/activity';
import { HouseholdSelector } from '@/components/household';
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
      <HouseholdSelector />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          Activity ({expenses.length})
        </Text>
        <Text style={styles.subtitle}>
          {expenses.length === 0
            ? 'Nothing here yet.'
            : formatCurrency(totalThisMonth)}
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
    marginBottom: spacing.md,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.text.muted,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.faint,
    marginTop: 2,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard, ProgressBar } from '@/components/ui';
import { getCategoryIcon } from '@/data/icons';
import { colors, radius, spacing, typography } from '@/theme';
import type { BudgetCategory } from '@/types';
import { clamp, formatCurrency, formatPercent } from '@/utils/format';

interface CategoryCardProps {
  category: BudgetCategory;
  onPress?: (category: BudgetCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
}) => {
  const accent = colors.accents[category.accent];
  const remaining = category.budgeted - category.spent;
  const ratio = category.budgeted > 0 ? category.spent / category.budgeted : 0;
  const overBudget = remaining < 0;
  const Icon = getCategoryIcon(category.iconKey);

  return (
    <AppCard
      onPress={onPress ? () => onPress(category) : undefined}
      style={styles.card}
      padded={false}
    >
      <View style={styles.inner}>
        <View style={[styles.iconWrap, { backgroundColor: accent.soft }]}>
          <Icon size={20} color={accent.base} strokeWidth={2.2} />
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>

        <Text
          style={[styles.remaining, overBudget && styles.overBudget]}
          numberOfLines={1}
        >
          {overBudget
            ? `${formatCurrency(Math.abs(remaining))} over`
            : `${formatCurrency(remaining)} left`}
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.progressFlex}>
            <ProgressBar
              value={clamp(ratio, 0, 1)}
              color={overBudget ? colors.status.danger : accent.base}
              trackColor={accent.soft}
              height={6}
            />
          </View>
          <Text style={styles.percent}>{formatPercent(ratio)}</Text>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  inner: {
    padding: spacing.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  remaining: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  overBudget: {
    color: colors.status.danger,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressFlex: {
    flex: 1,
  },
  percent: {
    ...typography.caption,
    color: colors.text.faint,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
});

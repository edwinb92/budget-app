import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { ProgressBar } from '@/components/ui';
import { getCategoryIcon } from '@/data/icons';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import type { BudgetCategory } from '@/types';
import { clamp, formatPercent } from '@/utils/format';

interface CategoryListItemProps {
  category: BudgetCategory;
  onPress: (category: BudgetCategory) => void;
}

export const CategoryListItem: React.FC<CategoryListItemProps> = ({
  category,
  onPress,
}) => {
  const formatMoney = useFormatCurrency();
  const accent = colors.accents[category.accent];
  const Icon = getCategoryIcon(category.iconKey);
  const remaining = category.budgeted - category.spent;
  const ratio = category.budgeted > 0 ? category.spent / category.budgeted : 0;
  const overBudget = remaining < 0;

  return (
    <Pressable
      onPress={() => onPress(category)}
      style={({ pressed }) => [
        styles.row,
        shadows.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent.soft }]}>
        <Icon size={22} color={accent.base} strokeWidth={2.2} />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {category.name}
          </Text>
          <Text
            style={[styles.remaining, overBudget && styles.overBudget]}
            numberOfLines={1}
          >
            {overBudget
              ? `${formatMoney(Math.abs(remaining))} over`
              : `${formatMoney(remaining)} left`}
          </Text>
        </View>

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

        <Text style={styles.budget}>
          {formatMoney(category.spent)} of {formatMoney(category.budgeted)}
        </Text>
      </View>

      <ChevronRight size={18} color={colors.text.faint} strokeWidth={2.4} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  name: {
    ...typography.subtitle,
    color: colors.text.primary,
    flex: 1,
  },
  remaining: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '700',
    marginLeft: spacing.sm,
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
  budget: {
    ...typography.caption,
    color: colors.text.faint,
  },
});

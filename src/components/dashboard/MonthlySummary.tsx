import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard, ProgressBar } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import type { MonthlySummary as MonthlySummaryModel } from '@/types';
import { clamp, formatCurrency, formatPercent } from '@/utils/format';

interface MonthlySummaryProps {
  summary: MonthlySummaryModel;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ summary }) => {
  const remaining = summary.budgeted - summary.spent;
  const ratio = summary.budgeted > 0 ? summary.spent / summary.budgeted : 0;
  const isHealthy = ratio < 0.85;

  return (
    <AppCard style={styles.card}>
      <Text style={styles.eyebrow}>Remaining this month</Text>
      <Text style={styles.remaining}>{formatCurrency(remaining)}</Text>

      <View style={styles.progressRow}>
        <ProgressBar
          value={clamp(ratio, 0, 1)}
          color={isHealthy ? colors.primary : colors.status.danger}
          height={10}
        />
        <Text style={styles.percent}>{formatPercent(ratio)}</Text>
      </View>

      <View style={styles.split}>
        <View style={styles.splitItem}>
          <Text style={styles.splitLabel}>Budgeted</Text>
          <Text style={styles.splitValue}>{formatCurrency(summary.budgeted)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.splitItem}>
          <Text style={styles.splitLabel}>Spent</Text>
          <Text style={[styles.splitValue, styles.spentValue]}>
            {formatCurrency(summary.spent)}
          </Text>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  remaining: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  percent: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  split: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  splitItem: {
    flex: 1,
  },
  splitLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  splitValue: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  spentValue: {
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
});

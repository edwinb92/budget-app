import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppCard, ProgressBar } from '@/components/ui';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { colors, spacing, typography } from '@/theme';
import type { MonthlySummary as MonthlySummaryModel } from '@/types';
import { clamp, formatPercent } from '@/utils/format';

interface MonthlySummaryProps {
  summary: MonthlySummaryModel;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ summary }) => {
  const { t } = useTranslation();
  const formatMoney = useFormatCurrency();
  const remaining = summary.budgeted - summary.spent;
  const ratio = summary.budgeted > 0 ? summary.spent / summary.budgeted : 0;
  const isHealthy = ratio < 0.85;

  return (
    <AppCard style={styles.card}>
      <Text style={styles.eyebrow}>{t('summary.remainingThisMonth')}</Text>
      <Text style={styles.remaining}>{formatMoney(remaining)}</Text>

      <View style={styles.progressRow}>
        <View style={styles.progressFlex}>
          <ProgressBar
            value={clamp(ratio, 0, 1)}
            color={isHealthy ? colors.primary : colors.status.danger}
            height={10}
          />
        </View>
        <Text style={styles.percent}>{formatPercent(ratio)}</Text>
      </View>

      <View style={styles.split}>
        <View style={styles.splitItem}>
          <Text style={styles.splitLabel}>{t('summary.budgeted')}</Text>
          <Text style={styles.splitValue}>{formatMoney(summary.budgeted)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.splitItem}>
          <Text style={styles.splitLabel}>{t('summary.spent')}</Text>
          <Text style={[styles.splitValue, styles.spentValue]}>
            {formatMoney(summary.spent)}
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
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  progressFlex: {
    flex: 1,
    marginRight: spacing.md,
  },
  percent: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '700',
    width: 56,
    textAlign: 'right',
    flexShrink: 0,
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

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui';
import { getCategoryIcon } from '@/data/icons';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { colors, radius, spacing, typography } from '@/theme';
import type { Bill } from '@/types';

interface BillCardProps {
  bill: Bill;
  onPress?: (bill: Bill) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onPress }) => {
  const formatMoney = useFormatCurrency();
  const accent = colors.accents[bill.accent];
  const Icon = getCategoryIcon(bill.iconKey);
  const isPaid = bill.status === 'paid';

  return (
    <AppCard
      onPress={onPress ? () => onPress(bill) : undefined}
      padded={false}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: accent.soft }]}>
          <Icon size={20} color={accent.base} strokeWidth={2.2} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{bill.name}</Text>
          <Text style={styles.meta}>Due day {bill.dueDay}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.amount}>{formatMoney(bill.amount)}</Text>
          <View
            style={[
              styles.statusPill,
              isPaid ? styles.paidPill : styles.pendingPill,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isPaid
                    ? colors.status.success
                    : colors.status.warning,
                },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                { color: isPaid ? colors.status.success : colors.status.warning },
              ]}
            >
              {isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  paidPill: {
    backgroundColor: '#E6F8F2',
  },
  pendingPill: {
    backgroundColor: '#FFF4E1',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
});

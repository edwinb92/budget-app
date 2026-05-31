import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { getCategoryIcon } from '@/data/icons';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useBudgetStore } from '@/store/budgetStore';
import { useExpenseEditorStore } from '@/store/expenseEditorStore';
import { useHouseholdStore } from '@/store/householdStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { Expense } from '@/types';

interface ExpenseRowProps {
  expense: Expense;
}

export const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense }) => {
  const category = useBudgetStore((s) =>
    s.categories.find((c) => c.id === expense.categoryId),
  );
  const payer = useHouseholdStore((s) =>
    s.users.find((u) => u.id === expense.paidById),
  );
  const currentUserId = useHouseholdStore((s) => s.currentUserId);
  const openEditor = useExpenseEditorStore((s) => s.open);
  const formatMoney = useFormatCurrency();

  if (!category) return null;

  const accent = colors.accents[category.accent];
  const Icon = getCategoryIcon(category.iconKey);
  const isSelf = payer?.id === currentUserId;
  const payerAccent = payer && !isSelf ? colors.accents[payer.accent] : null;

  return (
    <Pressable
      onPress={() => openEditor(expense.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent.soft }]}>
        <Icon size={20} color={accent.base} strokeWidth={2.2} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        {expense.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {expense.note}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
        {payer && payerAccent ? (
          <View
            style={[
              styles.payerBadge,
              { backgroundColor: payerAccent.soft },
            ]}
          >
            <Text style={[styles.payerInitial, { color: payerAccent.base }]}>
              {payer.initial}
            </Text>
          </View>
        ) : null}
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
  note: {
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
  payerBadge: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payerInitial: {
    fontSize: 11,
    fontWeight: '700',
  },
});

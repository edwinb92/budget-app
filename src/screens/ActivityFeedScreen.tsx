import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';

import { ActivityEmptyState, DayGroup } from '@/components/activity';
import { HouseholdSelector } from '@/components/household';
import { ScreenContainer } from '@/components/ui';
import { getCategoryIcon } from '@/data/icons';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useActivityFilterStore } from '@/store/activityFilterStore';
import { useBudgetStore } from '@/store/budgetStore';
import { colors, radius, spacing, typography } from '@/theme';
import { groupByDay } from '@/utils/date';

export const ActivityFeedScreen: React.FC = () => {
  const { t } = useTranslation();
  const allExpenses = useBudgetStore((s) => s.expenses);
  const categoryId = useActivityFilterStore((s) => s.categoryId);
  const clearFilter = useActivityFilterStore((s) => s.clearFilter);
  const formatMoney = useFormatCurrency();

  const filterCategory = useBudgetStore((s) =>
    categoryId ? s.categories.find((c) => c.id === categoryId) : undefined,
  );

  const expenses = useMemo(
    () =>
      categoryId
        ? allExpenses.filter((e) => e.categoryId === categoryId)
        : allExpenses,
    [allExpenses, categoryId],
  );

  const groups = useMemo(() => groupByDay(expenses), [expenses]);
  const totalThisMonth = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const isFiltering = !!filterCategory;
  const accent = filterCategory ? colors.accents[filterCategory.accent] : null;
  const FilterIcon = filterCategory
    ? getCategoryIcon(filterCategory.iconKey)
    : null;

  return (
    <ScreenContainer>
      <HouseholdSelector />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {isFiltering
            ? t('activity.filteredTitle')
            : t('activity.titleWithCount', { count: expenses.length })}
        </Text>
        <Text style={styles.subtitle}>
          {expenses.length === 0
            ? isFiltering
              ? t('activity.emptyFiltered')
              : t('activity.nothingYet')
            : `${t('activity.expensesCount', {
                count: expenses.length,
              })} · ${formatMoney(totalThisMonth)}`}
        </Text>
      </View>

      {isFiltering && filterCategory && accent && FilterIcon ? (
        <Pressable
          onPress={clearFilter}
          style={({ pressed }) => [
            styles.chip,
            { backgroundColor: accent.soft, borderColor: accent.base },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.chipIcon, { backgroundColor: accent.base }]}>
            <FilterIcon size={14} color={colors.onPrimary} strokeWidth={2.4} />
          </View>
          <View style={styles.chipText}>
            <Text style={styles.chipEyebrow}>{t('activity.filteringBy')}</Text>
            <Text style={[styles.chipName, { color: accent.base }]} numberOfLines={1}>
              {filterCategory.name}
            </Text>
          </View>
          <View style={styles.chipClose}>
            <X size={14} color={accent.base} strokeWidth={2.6} />
          </View>
        </Pressable>
      ) : null}

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
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    flex: 1,
  },
  chipEyebrow: {
    ...typography.overline,
    color: colors.text.muted,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  chipName: {
    ...typography.bodyStrong,
  },
  chipClose: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

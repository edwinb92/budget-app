import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, Tags, Wallet, X } from 'lucide-react-native';

import { ActivityEmptyState, DayGroup } from '@/components/activity';
import { HouseholdSelector } from '@/components/household';
import { ScreenContainer } from '@/components/ui';
import { getCategoryIcon } from '@/data/icons';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useActivityFilterStore } from '@/store/activityFilterStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import { useHouseholdStore } from '@/store/householdStore';
import { useNavStore } from '@/store/navStore';
import { colors, radius, spacing, typography } from '@/theme';
import { groupByDay } from '@/utils/date';

export const ActivityFeedScreen: React.FC = () => {
  const { t } = useTranslation();
  const allExpenses = useBudgetStore((s) => s.expenses);
  const categories = useBudgetStore((s) => s.categories);
  const households = useHouseholdStore((s) => s.households);
  const categoryId = useActivityFilterStore((s) => s.categoryId);
  const clearFilter = useActivityFilterStore((s) => s.clearFilter);
  const formatMoney = useFormatCurrency();
  const openCreateBudget = useHouseholdEditorStore((s) => s.openCreate);
  const setActiveTab = useNavStore((s) => s.setActiveTab);

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

  const hasBudget = households.length > 0;
  const hasCategories = categories.length > 0;

  if (!hasBudget) {
    return (
      <ScreenContainer>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Wallet size={32} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.emptyTitle}>{t('activity.noBudgetTitle')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('activity.noBudgetSubtitle')}
          </Text>
          <Pressable
            onPress={openCreateBudget}
            style={({ pressed }) => [
              styles.emptyCta,
              pressed && styles.pressedCta,
            ]}
          >
            <Plus size={18} color={colors.onPrimary} strokeWidth={2.6} />
            <Text style={styles.emptyCtaLabel}>
              {t('categories.createBudget')}
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!hasCategories) {
    return (
      <ScreenContainer>
        <HouseholdSelector />
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Tags size={32} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.emptyTitle}>
            {t('activity.noCategoriesTitle')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t('activity.noCategoriesSubtitle')}
          </Text>
          <Pressable
            onPress={() => setActiveTab('categories')}
            style={({ pressed }) => [
              styles.emptyCta,
              pressed && styles.pressedCta,
            ]}
          >
            <Text style={styles.emptyCtaLabel}>
              {t('activity.goToCategories')}
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const filterCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : undefined;
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
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  pressedCta: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  emptyCtaLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});

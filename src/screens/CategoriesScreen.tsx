import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, Wallet } from 'lucide-react-native';

import { CategoryListItem } from '@/components/categories';
import { HouseholdSelector } from '@/components/household';
import { ScreenContainer } from '@/components/ui';
import { useBudgetStore } from '@/store/budgetStore';
import { useCategoryEditorStore } from '@/store/categoryEditorStore';
import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import { useHouseholdStore } from '@/store/householdStore';
import { colors, radius, spacing, typography } from '@/theme';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

export const CategoriesScreen: React.FC = () => {
  const { t } = useTranslation();
  const categories = useBudgetStore((s) => s.categories);
  const households = useHouseholdStore((s) => s.households);
  const openCreate = useCategoryEditorStore((s) => s.openCreate);
  const openEdit = useCategoryEditorStore((s) => s.openEdit);
  const openCreateBudget = useHouseholdEditorStore((s) => s.openCreate);
  const formatMoney = useFormatCurrency();

  const hasBudget = households.length > 0;

  if (!hasBudget) {
    return (
      <ScreenContainer>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Wallet size={32} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.emptyTitle}>{t('categories.noBudgetTitle')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('categories.noBudgetSubtitle')}
          </Text>
          <Pressable
            onPress={openCreateBudget}
            style={({ pressed }) => [
              styles.emptyCta,
              pressed && styles.pressed,
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

  const totalBudget = categories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  return (
    <ScreenContainer>
      <HouseholdSelector />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>
              {t('categories.titleWithCount', { count: categories.length })}
            </Text>
            <Text style={styles.subtitle}>
              {t('categories.spentOf', {
                spent: formatMoney(totalSpent),
                total: formatMoney(totalBudget),
              })}
            </Text>
          </View>

          <Pressable
            onPress={openCreate}
            style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Plus size={18} color={colors.onPrimary} strokeWidth={2.6} />
            <Text style={styles.newBtnLabel}>{t('categories.new')}</Text>
          </Pressable>
        </View>
      </View>

      {categories.map((category) => (
        <CategoryListItem
          key={category.id}
          category={category}
          onPress={(c) => openEdit(c.id)}
        />
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  newBtnLabel: {
    ...typography.caption,
    color: colors.onPrimary,
    fontWeight: '700',
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
  emptyCtaLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});

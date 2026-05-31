import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';

import { CategoryListItem } from '@/components/categories';
import { HouseholdSelector } from '@/components/household';
import { ScreenContainer } from '@/components/ui';
import { useBudgetStore } from '@/store/budgetStore';
import { useCategoryEditorStore } from '@/store/categoryEditorStore';
import { colors, radius, spacing, typography } from '@/theme';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

export const CategoriesScreen: React.FC = () => {
  const { t } = useTranslation();
  const categories = useBudgetStore((s) => s.categories);
  const openCreate = useCategoryEditorStore((s) => s.openCreate);
  const openEdit = useCategoryEditorStore((s) => s.openEdit);
  const formatMoney = useFormatCurrency();

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
});

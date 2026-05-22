import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import { CategoryListItem } from '@/components/categories';
import { ScreenContainer } from '@/components/ui';
import { useBudgetStore } from '@/store/budgetStore';
import { useCategoryEditorStore } from '@/store/categoryEditorStore';
import { colors, radius, spacing, typography } from '@/theme';
import { formatCurrency } from '@/utils/format';

export const CategoriesScreen: React.FC = () => {
  const categories = useBudgetStore((s) => s.categories);
  const openCreate = useCategoryEditorStore((s) => s.openCreate);
  const openEdit = useCategoryEditorStore((s) => s.openEdit);

  const totalBudget = categories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Categories</Text>
            <Text style={styles.subtitle}>
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              {' · '}
              {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
            </Text>
          </View>

          <Pressable
            onPress={openCreate}
            style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Plus size={18} color={colors.onPrimary} strokeWidth={2.6} />
            <Text style={styles.newBtnLabel}>New</Text>
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
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
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

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Plus,
  Receipt,
  Tags,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import {
  BillCard,
  CategoryCard,
  MonthlySummary,
} from '@/components/dashboard';
import { HouseholdSelector } from '@/components/household';
import { ScreenContainer, SectionTitle } from '@/components/ui';
import { useActivityFilterStore } from '@/store/activityFilterStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import {
  selectCurrentUser,
  useHouseholdStore,
} from '@/store/householdStore';
import { useNavStore } from '@/store/navStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { BudgetCategory } from '@/types';

const SectionEmpty: React.FC<{ icon: LucideIcon; message: string }> = ({
  icon: Icon,
  message,
}) => (
  <View style={styles.empty}>
    <Icon size={22} color={colors.text.faint} strokeWidth={2} />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const summary = useBudgetStore((s) => s.summary);
  const categories = useBudgetStore((s) => s.categories);
  const bills = useBudgetStore((s) => s.bills);
  const households = useHouseholdStore((s) => s.households);
  const currentUser = useHouseholdStore(selectCurrentUser);
  const setActiveTab = useNavStore((s) => s.setActiveTab);
  const setCategoryFilter = useActivityFilterStore((s) => s.setCategoryFilter);
  const openCreateBudget = useHouseholdEditorStore((s) => s.openCreate);

  const hasBudget = households.length > 0;
  const hasCategories = categories.length > 0;

  if (!hasBudget) {
    return (
      <ScreenContainer>
        <View style={styles.fullEmpty}>
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
        <View style={styles.fullEmpty}>
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

  const firstName = currentUser?.name.trim().split(/\s+/)[0] ?? '';
  const greeting = firstName
    ? t('dashboard.greeting', { name: firstName })
    : t('dashboard.greetingFallback');

  const handleCategoryPress = (category: BudgetCategory) => {
    setCategoryFilter(category.id);
    setActiveTab('activity');
  };

  return (
    <ScreenContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subgreeting}>{summary.monthLabel}</Text>
          </View>
          <View style={styles.bell}>
            <Bell size={20} color={colors.text.primary} strokeWidth={2.2} />
          </View>
        </View>

        <HouseholdSelector />

        <MonthlySummary summary={summary} />

        <View style={styles.section}>
          <SectionTitle
            title={t('dashboard.categoriesSection')}
            actionLabel={t('dashboard.seeAll')}
          />
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={handleCategoryPress}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle
            title={t('dashboard.billsSection')}
            actionLabel={t('dashboard.manage')}
          />
          {bills.length === 0 ? (
            <SectionEmpty icon={Receipt} message={t('dashboard.billsEmpty')} />
          ) : (
            bills.map((bill) => <BillCard key={bill.id} bill={bill} />)
          )}
        </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.title,
    color: colors.text.primary,
  },
  subgreeting: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginTop: spacing.xl,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  emptyText: {
    ...typography.caption,
    color: colors.text.faint,
    textAlign: 'center',
  },
  fullEmpty: {
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

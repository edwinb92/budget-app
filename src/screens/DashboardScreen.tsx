import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell, Receipt, Tags, type LucideIcon } from 'lucide-react-native';

import {
  BillCard,
  CategoryCard,
  MonthlySummary,
} from '@/components/dashboard';
import { HouseholdSelector } from '@/components/household';
import { ScreenContainer, SectionTitle } from '@/components/ui';
import { useActivityFilterStore } from '@/store/activityFilterStore';
import { useBudgetStore } from '@/store/budgetStore';
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
  const summary = useBudgetStore((s) => s.summary);
  const categories = useBudgetStore((s) => s.categories);
  const bills = useBudgetStore((s) => s.bills);
  const currentUser = useHouseholdStore(selectCurrentUser);
  const setActiveTab = useNavStore((s) => s.setActiveTab);
  const setCategoryFilter = useActivityFilterStore((s) => s.setCategoryFilter);

  const firstName = currentUser?.name.trim().split(/\s+/)[0] ?? '';
  const greeting = firstName ? `Hi, ${firstName}` : 'Hi';

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
          <SectionTitle title="Categories" actionLabel="See all" />
          {categories.length === 0 ? (
            <SectionEmpty
              icon={Tags}
              message="No categories yet. Create one to start budgeting."
            />
          ) : (
            <View style={styles.grid}>
              {categories.map((category, index) => (
                <View
                  key={category.id}
                  style={[
                    styles.gridItem,
                    index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
                  ]}
                >
                  <CategoryCard
                    category={category}
                    onPress={handleCategoryPress}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Bills" actionLabel="Manage" />
          {bills.length === 0 ? (
            <SectionEmpty
              icon={Receipt}
              message="No bills yet. Recurring payments will show up here."
            />
          ) : (
            bills.map((bill) => <BillCard key={bill.id} bill={bill} />)
          )}
        </View>
    </ScreenContainer>
  );
};

const GRID_GUTTER = spacing.md;

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GRID_GUTTER / 2,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: GRID_GUTTER / 2,
    marginBottom: GRID_GUTTER,
  },
  gridItemLeft: {},
  gridItemRight: {},
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
});

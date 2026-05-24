import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import {
  BillCard,
  CategoryCard,
  MonthlySummary,
} from '@/components/dashboard';
import { HouseholdSelector } from '@/components/household';
import { ScreenContainer, SectionTitle } from '@/components/ui';
import { useBudgetStore } from '@/store/budgetStore';
import { colors, radius, spacing, typography } from '@/theme';

export const DashboardScreen: React.FC = () => {
  const summary = useBudgetStore((s) => s.summary);
  const categories = useBudgetStore((s) => s.categories);
  const bills = useBudgetStore((s) => s.bills);

  return (
    <ScreenContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, Edan</Text>
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
          <View style={styles.grid}>
            {categories.map((category, index) => (
              <View
                key={category.id}
                style={[
                  styles.gridItem,
                  index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
                ]}
              >
                <CategoryCard category={category} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Bills" actionLabel="Manage" />
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
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
});

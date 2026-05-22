import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OptionTile } from '@/components/wizard/OptionTile';
import { getCategoryIcon } from '@/data/icons';
import { useBudgetStore } from '@/store/budgetStore';
import { useWizardStore } from '@/store/wizardStore';
import { colors, spacing, typography } from '@/theme';

export const StepCategory: React.FC = () => {
  const categories = useBudgetStore((s) => s.categories);
  const selected = useWizardStore((s) => s.draft.categoryId);
  const setCategoryId = useWizardStore((s) => s.setCategoryId);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>What category?</Text>
      <Text style={styles.subtitle}>Pick where this expense belongs.</Text>

      <View style={styles.grid}>
        {categories.map((category, index) => (
          <View
            key={category.id}
            style={[
              styles.gridItem,
              index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
            ]}
          >
            <OptionTile
              label={category.name}
              accent={category.accent}
              icon={getCategoryIcon(category.iconKey)}
              selected={selected === category.id}
              onPress={() => setCategoryId(category.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const GUTTER = spacing.md;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GUTTER / 2,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: GUTTER / 2,
    marginBottom: GUTTER,
  },
  gridItemLeft: {},
  gridItemRight: {},
});

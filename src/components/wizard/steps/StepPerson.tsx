import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OptionTile } from '@/components/wizard/OptionTile';
import { mockMembers } from '@/data/mockData';
import { useWizardStore } from '@/store/wizardStore';
import { colors, spacing, typography } from '@/theme';

export const StepPerson: React.FC = () => {
  const selected = useWizardStore((s) => s.draft.paidById);
  const setPaidById = useWizardStore((s) => s.setPaidById);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Who paid?</Text>
      <Text style={styles.subtitle}>So we can split fairly later.</Text>

      <View style={styles.row}>
        {mockMembers.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.cell,
              index === 0 ? styles.cellLeft : styles.cellRight,
            ]}
          >
            <OptionTile
              label={member.name}
              accent={member.accent}
              initial={member.initial}
              selected={selected === member.id}
              onPress={() => setPaidById(member.id)}
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
  row: {
    flexDirection: 'row',
    marginHorizontal: -GUTTER / 2,
  },
  cell: {
    flex: 1,
    paddingHorizontal: GUTTER / 2,
  },
  cellLeft: {},
  cellRight: {},
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { OptionTile } from '@/components/wizard/OptionTile';
import {
  selectActiveHouseholdMembers,
  useHouseholdStore,
} from '@/store/householdStore';
import { useWizardStore } from '@/store/wizardStore';
import { colors, spacing, typography } from '@/theme';

export const StepPerson: React.FC = () => {
  const selected = useWizardStore((s) => s.draft.paidById);
  const setPaidById = useWizardStore((s) => s.setPaidById);
  const members = useHouseholdStore(useShallow(selectActiveHouseholdMembers));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Who paid?</Text>
      <Text style={styles.subtitle}>So we can split fairly later.</Text>

      <View style={styles.row}>
        {members.map((member) => (
          <View key={member.id} style={styles.cell}>
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
    gap: spacing.md,
  },
  cell: {
    flex: 1,
  },
});

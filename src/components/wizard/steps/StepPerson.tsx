import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { OptionTile } from '@/components/wizard/OptionTile';
import {
  selectActiveHouseholdMembers,
  useHouseholdStore,
} from '@/store/householdStore';
import { useWizardStore } from '@/store/wizardStore';
import { colors, spacing, typography } from '@/theme';

export const StepPerson: React.FC = () => {
  const { t } = useTranslation();
  const selected = useWizardStore((s) => s.draft.paidById);
  const setPaidById = useWizardStore((s) => s.setPaidById);
  const members = useHouseholdStore(useShallow(selectActiveHouseholdMembers));
  const currentUserId = useHouseholdStore((s) => s.currentUserId);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('wizard.stepPersonTitle')}</Text>
      <Text style={styles.subtitle}>{t('wizard.stepPersonSubtitle')}</Text>

      <View style={styles.row}>
        {members.map((member) => (
          <View key={member.id} style={styles.cell}>
            <OptionTile
              label={member.id === currentUserId ? t('common.you') : member.name}
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

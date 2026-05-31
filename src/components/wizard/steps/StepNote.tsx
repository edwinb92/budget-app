import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useWizardStore } from '@/store/wizardStore';
import { colors, radius, spacing, typography } from '@/theme';

export const StepNote: React.FC = () => {
  const { t } = useTranslation();
  const note = useWizardStore((s) => s.draft.note);
  const setNote = useWizardStore((s) => s.setNote);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('wizard.stepNoteTitle')}</Text>
      <Text style={styles.subtitle}>{t('wizard.stepNoteSubtitle')}</Text>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder={t('wizard.stepNotePlaceholder')}
        placeholderTextColor={colors.text.faint}
        style={styles.input}
        multiline
        maxLength={140}
        autoFocus
        selectionColor={colors.primary}
      />

      <Text style={styles.counter}>{note.length}/140</Text>
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
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  counter: {
    ...typography.caption,
    color: colors.text.faint,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
});

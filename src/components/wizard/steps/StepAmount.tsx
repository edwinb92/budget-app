import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AmountDisplay } from '@/components/wizard/AmountDisplay';
import { QuickAmountChip } from '@/components/wizard/QuickAmountChip';
import { useWizardStore } from '@/store/wizardStore';
import { colors, spacing, typography } from '@/theme';

const QUICK_AMOUNTS = [10, 50, 100, 200];

export const StepAmount: React.FC = () => {
  const { t } = useTranslation();
  const amount = useWizardStore((s) => s.draft.amount);
  const setAmount = useWizardStore((s) => s.setAmount);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('wizard.stepAmountTitle')}</Text>
      <Text style={styles.subtitle}>{t('wizard.stepAmountSubtitle')}</Text>

      <AmountDisplay value={amount} onChange={setAmount} />

      <View style={styles.chips}>
        {QUICK_AMOUNTS.map((value) => (
          <QuickAmountChip
            key={value}
            value={value}
            selected={amount === value}
            onPress={setAmount}
          />
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
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
});

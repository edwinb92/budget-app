import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react-native';

import { PrimaryButton } from '@/components/ui';
import { colors, spacing } from '@/theme';

interface WizardFooterProps {
  isLast: boolean;
  canAdvance: boolean;
  onNext: () => void;
  onSave: () => void;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({
  isLast,
  canAdvance,
  onNext,
  onSave,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <PrimaryButton
        label={isLast ? t('wizard.save') : t('wizard.next')}
        icon={isLast ? Check : ArrowRight}
        onPress={isLast ? onSave : onNext}
        disabled={!canAdvance}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});

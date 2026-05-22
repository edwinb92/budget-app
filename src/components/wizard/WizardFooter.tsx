import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  return (
    <View style={styles.wrap}>
      <PrimaryButton
        label={isLast ? 'Save expense' : 'Next'}
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

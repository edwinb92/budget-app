import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, X } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface WizardHeaderProps {
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
  onClose: () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  stepIndex,
  totalSteps,
  canGoBack,
  onBack,
  onClose,
}) => {
  const progress = (stepIndex + 1) / totalSteps;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          disabled={!canGoBack}
          hitSlop={12}
          style={({ pressed }) => [
            styles.iconBtn,
            !canGoBack && styles.iconBtnDisabled,
            pressed && canGoBack && styles.pressed,
          ]}
        >
          <ArrowLeft
            size={20}
            color={canGoBack ? colors.text.primary : colors.text.faint}
            strokeWidth={2.4}
          />
        </Pressable>

        <Text style={styles.step}>
          Step {stepIndex + 1} of {totalSteps}
        </Text>

        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <X size={20} color={colors.text.primary} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  step: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
});

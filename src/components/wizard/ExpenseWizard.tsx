import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WizardFooter } from '@/components/wizard/WizardFooter';
import { WizardHeader } from '@/components/wizard/WizardHeader';
import { StepAmount } from '@/components/wizard/steps/StepAmount';
import { StepCategory } from '@/components/wizard/steps/StepCategory';
import { StepNote } from '@/components/wizard/steps/StepNote';
import { StepPerson } from '@/components/wizard/steps/StepPerson';
import {
  WIZARD_STEPS,
  selectCanAdvance,
  useWizardStore,
} from '@/store/wizardStore';
import { colors, spacing } from '@/theme';

const renderStep = (index: number): React.ReactNode => {
  const step = WIZARD_STEPS[index];
  switch (step) {
    case 'category':
      return <StepCategory />;
    case 'amount':
      return <StepAmount />;
    case 'note':
      return <StepNote />;
    case 'person':
      return <StepPerson />;
    default:
      return null;
  }
};

export const ExpenseWizard: React.FC = () => {
  const isOpen = useWizardStore((s) => s.isOpen);
  const stepIndex = useWizardStore((s) => s.stepIndex);
  const canAdvance = useWizardStore(selectCanAdvance);
  const close = useWizardStore((s) => s.close);
  const back = useWizardStore((s) => s.back);
  const next = useWizardStore((s) => s.next);
  const save = useWizardStore((s) => s.save);

  const isLast = stepIndex === WIZARD_STEPS.length - 1;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <WizardHeader
            stepIndex={stepIndex}
            totalSteps={WIZARD_STEPS.length}
            canGoBack={stepIndex > 0}
            onBack={back}
            onClose={close}
          />

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepWrap}>{renderStep(stepIndex)}</View>
          </ScrollView>

          <WizardFooter
            isLast={isLast}
            canAdvance={canAdvance}
            onNext={next}
            onSave={save}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  stepWrap: {
    flex: 1,
    paddingTop: spacing.md,
  },
});

import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { CurrencyPicker } from '@/components/household/CurrencyPicker';
import { PrimaryButton } from '@/components/ui';
import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import { useHouseholdStore } from '@/store/householdStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { CurrencyCode } from '@/types';

export const CreateHouseholdModal: React.FC = () => {
  const { t } = useTranslation();
  const isOpen = useHouseholdEditorStore((s) => s.createOpen);
  const close = useHouseholdEditorStore((s) => s.closeCreate);
  const createHousehold = useHouseholdStore((s) => s.createHousehold);

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setCurrency('USD');
    }
  }, [isOpen]);

  const canCreate = name.trim().length > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    createHousehold({ name, currency });
    close();
  };

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
          <View style={styles.header}>
            <Text style={styles.title}>{t('household.newBudget')}</Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <X size={20} color={colors.text.primary} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.intro}>{t('household.createIntro')}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('household.nameLabel')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('household.namePlaceholder')}
                placeholderTextColor={colors.text.faint}
                style={styles.nameInput}
                autoFocus
                selectionColor={colors.primary}
                maxLength={48}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('household.currencyLabel')}</Text>
              <CurrencyPicker value={currency} onChange={setCurrency} />
              <Text style={styles.hint}>{t('household.currencyHint')}</Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={t('household.createBudget')}
              onPress={handleCreate}
              disabled={!canCreate}
            />
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
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
  pressed: {
    opacity: 0.7,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  intro: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  nameInput: {
    ...typography.title,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.text.faint,
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});

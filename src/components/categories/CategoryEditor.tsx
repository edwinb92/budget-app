import React from 'react';
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
import { Trash2, X } from 'lucide-react-native';

import { AccentPicker } from '@/components/categories/AccentPicker';
import { BudgetInput } from '@/components/categories/BudgetInput';
import { IconPicker } from '@/components/categories/IconPicker';
import { PrimaryButton } from '@/components/ui';
import {
  selectCanSave,
  useCategoryEditorStore,
} from '@/store/categoryEditorStore';
import { colors, radius, spacing, typography } from '@/theme';

export const CategoryEditor: React.FC = () => {
  const { t } = useTranslation();
  const mode = useCategoryEditorStore((s) => s.mode);
  const draft = useCategoryEditorStore((s) => s.draft);
  const canSave = useCategoryEditorStore(selectCanSave);
  const close = useCategoryEditorStore((s) => s.close);
  const setName = useCategoryEditorStore((s) => s.setName);
  const setIconKey = useCategoryEditorStore((s) => s.setIconKey);
  const setAccent = useCategoryEditorStore((s) => s.setAccent);
  const setBudgeted = useCategoryEditorStore((s) => s.setBudgeted);
  const save = useCategoryEditorStore((s) => s.save);
  const remove = useCategoryEditorStore((s) => s.remove);

  const isOpen = mode !== 'closed';
  const isEdit = mode === 'edit';

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
            <Text style={styles.title}>
              {isEdit ? t('categories.editor.editTitle') : t('categories.editor.newTitle')}
            </Text>
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
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('categories.editor.nameLabel')}</Text>
              <TextInput
                value={draft.name}
                onChangeText={setName}
                placeholder={t('categories.editor.namePlaceholder')}
                placeholderTextColor={colors.text.faint}
                style={styles.nameInput}
                autoFocus={!isEdit}
                selectionColor={colors.primary}
                maxLength={32}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('categories.editor.colorLabel')}</Text>
              <AccentPicker value={draft.accent} onChange={setAccent} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('categories.editor.iconLabel')}</Text>
              <IconPicker
                value={draft.iconKey}
                accent={draft.accent}
                onChange={setIconKey}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('categories.editor.budgetLabel')}</Text>
              <BudgetInput value={draft.budgeted} onChange={setBudgeted} />
            </View>

            {isEdit ? (
              <Pressable
                onPress={remove}
                style={({ pressed }) => [
                  styles.deleteBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Trash2 size={18} color={colors.status.danger} strokeWidth={2.2} />
                <Text style={styles.deleteLabel}>{t('categories.editor.deleteButton')}</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={isEdit ? t('categories.editor.saveButton') : t('categories.editor.createButton')}
              onPress={save}
              disabled={!canSave}
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
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  deleteLabel: {
    ...typography.body,
    color: colors.status.danger,
    fontWeight: '700',
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

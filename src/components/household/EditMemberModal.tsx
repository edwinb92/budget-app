import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { User } from '@/types';

interface EditMemberModalProps {
  member: User | null;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    if (member) setDraftName(member.name);
  }, [member]);

  const trimmed = draftName.trim();
  const isValid = trimmed.length > 0;
  const isDirty = !!member && trimmed !== member.name;

  const handleSave = () => {
    if (!member || !isValid || !isDirty) return;
    onSave(trimmed);
  };

  return (
    <Modal
      visible={!!member}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, spacing.lg) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>{t('member.editTitle')}</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              >
                <X size={18} color={colors.text.primary} strokeWidth={2.4} />
              </Pressable>
            </View>

            <Text style={styles.label}>{t('member.nameLabel')}</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              style={styles.input}
              selectionColor={colors.primary}
              autoFocus
              maxLength={48}
              placeholder={t('member.namePlaceholder')}
              placeholderTextColor={colors.text.faint}
            />

            <Pressable
              onPress={handleSave}
              disabled={!isValid || !isDirty}
              style={({ pressed }) => [
                styles.saveBtn,
                (!isValid || !isDirty) && styles.saveBtnDisabled,
                pressed && isValid && isDirty && styles.pressed,
              ]}
            >
              <Text style={styles.saveLabel}>{t('member.saveChanges')}</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 34, 48, 0.45)',
    justifyContent: 'flex-end',
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  iconBtn: {
    width: 36,
    height: 36,
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
  label: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.subtitle,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  saveBtn: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: colors.border,
  },
  saveLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});

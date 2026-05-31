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
import { X } from 'lucide-react-native';

import { AccentPicker } from '@/components/categories/AccentPicker';
import {
  selectCurrentUser,
  useHouseholdStore,
} from '@/store/householdStore';
import { useProfileEditorStore } from '@/store/profileEditorStore';
import type { AccentName } from '@/theme';
import { colors, radius, spacing, typography } from '@/theme';

export const ProfileEditorSheet: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isOpen = useProfileEditorStore((s) => s.profileOpen);
  const close = useProfileEditorStore((s) => s.closeProfile);

  const currentUser = useHouseholdStore(selectCurrentUser);
  const updateUser = useHouseholdStore((s) => s.updateUser);

  const [draftName, setDraftName] = useState('');
  const [draftAccent, setDraftAccent] = useState<AccentName>('violet');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setDraftName(currentUser.name);
      setDraftAccent(currentUser.accent);
    }
  }, [isOpen, currentUser]);

  if (!currentUser) return null;

  const trimmedName = draftName.trim();
  const nameValid = trimmedName.length > 0;
  const isDirty =
    trimmedName !== currentUser.name || draftAccent !== currentUser.accent;
  const canSave = nameValid && isDirty && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    await updateUser(currentUser.id, {
      name: trimmedName,
      accent: draftAccent,
    });
    setSubmitting(false);
    close();
  };

  const previewInitial =
    (trimmedName.charAt(0) || currentUser.initial || '?').toUpperCase();
  const previewAccent = colors.accents[draftAccent];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close}>
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
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>Edit profile</Text>
                <Text style={styles.title}>Your details</Text>
              </View>
              <Pressable
                onPress={close}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                ]}
              >
                <X size={18} color={colors.text.primary} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.previewWrap}>
              <View
                style={[
                  styles.previewAvatar,
                  { backgroundColor: previewAccent.soft },
                ]}
              >
                <Text
                  style={[
                    styles.previewInitial,
                    { color: previewAccent.base },
                  ]}
                >
                  {previewInitial}
                </Text>
              </View>
              <Text style={styles.previewLabel}>Preview</Text>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              style={styles.input}
              selectionColor={colors.primary}
              placeholder="Your name"
              placeholderTextColor={colors.text.faint}
              maxLength={48}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Accent color</Text>
            <View style={styles.accentRow}>
              <AccentPicker value={draftAccent} onChange={setDraftAccent} />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={[styles.input, styles.readonlyInput]}>
              <Text style={styles.readonlyText} numberOfLines={1}>
                {currentUser.email}
              </Text>
            </View>
            <Text style={styles.hint}>Email can&apos;t be changed for now.</Text>

            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.saveBtn,
                !canSave && styles.saveBtnDisabled,
                pressed && canSave && styles.pressed,
              ]}
            >
              <Text style={styles.saveLabel}>
                {submitting ? 'Saving...' : 'Save changes'}
              </Text>
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
  headerText: {
    flex: 1,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: 2,
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
  previewWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  previewInitial: {
    fontSize: 30,
    fontWeight: '700',
  },
  previewLabel: {
    ...typography.overline,
    color: colors.text.faint,
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
  accentRow: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  readonlyInput: {
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  readonlyText: {
    ...typography.subtitle,
    color: colors.text.muted,
  },
  hint: {
    ...typography.caption,
    color: colors.text.faint,
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

import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { KeyRound, X } from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { useProfileEditorStore } from '@/store/profileEditorStore';
import { colors, radius, spacing, typography } from '@/theme';

export const ChangePasswordSheet: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isOpen = useProfileEditorStore((s) => s.passwordOpen);
  const close = useProfileEditorStore((s) => s.closePassword);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirm('');
      setError(null);
    }
  }, [isOpen]);

  const longEnough = password.length >= 6;
  const matches = password.length > 0 && password === confirm;
  const canSubmit = longEnough && matches && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (err) {
      setError(err.message);
      return;
    }

    close();
    Alert.alert('Password updated', 'Your password has been changed.');
  };

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
              <View style={styles.iconWrap}>
                <KeyRound size={20} color={colors.onPrimary} strokeWidth={2.4} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>Security</Text>
                <Text style={styles.title}>Change password</Text>
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

            <Text style={styles.label}>New password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              selectionColor={colors.primary}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.text.faint}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              autoFocus
            />

            <Text style={styles.label}>Confirm new password</Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
              selectionColor={colors.primary}
              placeholder="Repeat the password"
              placeholderTextColor={colors.text.faint}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              onSubmitEditing={handleSubmit}
              returnKeyType="go"
            />

            {!longEnough && password.length > 0 ? (
              <Text style={styles.warning}>
                Password must be at least 6 characters.
              </Text>
            ) : null}
            {longEnough && confirm.length > 0 && !matches ? (
              <Text style={styles.warning}>Passwords don&apos;t match.</Text>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                !canSubmit && styles.submitBtnDisabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              <Text style={styles.submitLabel}>
                {submitting ? 'Updating...' : 'Update password'}
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
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  warning: {
    ...typography.caption,
    color: colors.status.warning,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  error: {
    ...typography.caption,
    color: colors.status.danger,
    fontWeight: '600',
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  submitBtn: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: colors.border,
  },
  submitLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});

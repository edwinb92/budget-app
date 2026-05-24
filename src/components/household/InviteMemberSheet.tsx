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
import { Mail, X } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface InviteMemberSheetProps {
  visible: boolean;
  householdName: string;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InviteMemberSheet: React.FC<InviteMemberSheetProps> = ({
  visible,
  householdName,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (visible) setEmail('');
  }, [visible]);

  const trimmed = email.trim();
  const isValid = EMAIL_RE.test(trimmed);

  const handleSend = () => {
    if (!isValid) return;
    const target = trimmed;
    onClose();
    Alert.alert(
      'Invitation sent',
      `We sent an invite to ${target}. They'll appear here once they accept.`,
    );
  };

  return (
    <Modal
      visible={visible}
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
              <View style={styles.iconWrap}>
                <Mail size={20} color={colors.onPrimary} strokeWidth={2.4} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>Invite to budget</Text>
                <Text style={styles.title} numberOfLines={1}>
                  {householdName}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                ]}
              >
                <X size={18} color={colors.text.primary} strokeWidth={2.4} />
              </Pressable>
            </View>

            <Text style={styles.subtitle}>
              We&apos;ll email them a link to join this budget.
            </Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              selectionColor={colors.primary}
              placeholder="name@example.com"
              placeholderTextColor={colors.text.faint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoFocus
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />

            <Pressable
              onPress={handleSend}
              disabled={!isValid}
              style={({ pressed }) => [
                styles.sendBtn,
                !isValid && styles.sendBtnDisabled,
                pressed && isValid && styles.pressed,
              ]}
            >
              <Text style={styles.sendLabel}>Send invitation</Text>
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
    marginBottom: spacing.md,
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
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.lg,
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
  sendBtn: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
  sendLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});

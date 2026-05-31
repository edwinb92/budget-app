import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pencil, Trash2 } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { User } from '@/types';

interface MemberActionsSheetProps {
  member: User | null;
  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export const MemberActionsSheet: React.FC<MemberActionsSheetProps> = ({
  member,
  onClose,
  onEdit,
  onRemove,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const visible = !!member;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          {member ? (
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {member.name}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {member.email}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <Pencil size={18} color={colors.primary} strokeWidth={2.4} />
            </View>
            <Text style={styles.actionLabel}>{t('member.editMember')}</Text>
          </Pressable>

          <Pressable
            onPress={onRemove}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, styles.iconWrapDanger]}>
              <Trash2 size={18} color={colors.status.danger} strokeWidth={2.4} />
            </View>
            <Text style={[styles.actionLabel, styles.actionLabelDanger]}>
              {t('member.removeMember')}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
          >
            <Text style={styles.cancelLabel}>{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
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
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(255, 122, 107, 0.12)',
  },
  actionLabel: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  actionLabelDanger: {
    color: colors.status.danger,
  },
  cancelBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelLabel: {
    ...typography.subtitle,
    color: colors.text.muted,
  },
});

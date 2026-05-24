import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Crown, MoreHorizontal } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { MembershipRole, User } from '@/types';

interface MemberRowProps {
  user: User;
  role: MembershipRole;
  isCurrentUser: boolean;
  canManage: boolean;
  onRemove?: () => void;
}

export const MemberRow: React.FC<MemberRowProps> = ({
  user,
  role,
  isCurrentUser,
  canManage,
  onRemove,
}) => {
  const accent = colors.accents[user.accent];
  const isOwner = role === 'owner';

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: accent.soft }]}>
        <Text style={[styles.initial, { color: accent.base }]}>
          {user.initial}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {user.name}
            {isCurrentUser ? ' (you)' : ''}
          </Text>
          {isOwner ? (
            <View style={styles.ownerBadge}>
              <Crown size={11} color={colors.status.warning} strokeWidth={2.6} />
              <Text style={styles.ownerLabel}>Owner</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {canManage && !isCurrentUser && !isOwner ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={({ pressed }) => [styles.moreBtn, pressed && styles.pressed]}
        >
          <MoreHorizontal size={18} color={colors.text.muted} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF4E1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  ownerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.warning,
  },
  email: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  moreBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});

import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Plus, Trash2, X } from 'lucide-react-native';

import { CurrencyPicker } from '@/components/household/CurrencyPicker';
import { EditMemberModal } from '@/components/household/EditMemberModal';
import { MemberActionsSheet } from '@/components/household/MemberActionsSheet';
import { MemberRow } from '@/components/household/MemberRow';
import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import {
  useHouseholdStore,
} from '@/store/householdStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { CurrencyCode, Membership, User } from '@/types';

export const ManageHouseholdModal: React.FC = () => {
  const householdId = useHouseholdEditorStore((s) => s.manageOpenForId);
  const close = useHouseholdEditorStore((s) => s.closeManage);

  const household = useHouseholdStore((s) =>
    householdId ? s.households.find((h) => h.id === householdId) : undefined,
  );
  const currentUserId = useHouseholdStore((s) => s.currentUserId);
  const users = useHouseholdStore((s) => s.users);
  const memberships = useHouseholdStore((s) => s.memberships);
  const renameHousehold = useHouseholdStore((s) => s.renameHousehold);
  const setHouseholdCurrency = useHouseholdStore((s) => s.setHouseholdCurrency);
  const removeUserFromHousehold = useHouseholdStore(
    (s) => s.removeUserFromHousehold,
  );
  const deleteHousehold = useHouseholdStore((s) => s.deleteHousehold);
  const updateUser = useHouseholdStore((s) => s.updateUser);

  const [actionsMember, setActionsMember] = useState<User | null>(null);
  const [editingMember, setEditingMember] = useState<User | null>(null);

  const members =
    householdId && memberships && users
      ? memberships
          .filter((m) => m.householdId === householdId)
          .map((m) => {
            const user = users.find((u) => u.id === m.userId);
            return user ? { user, role: m.role } : null;
          })
          .filter(
            (x): x is { user: typeof users[0]; role: Membership['role'] } =>
              x !== null,
          )
      : [];

  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    if (household) setDraftName(household.name);
  }, [household]);

  if (!household || !householdId) return null;

  const isOwner = household.createdBy === currentUserId;
  const canDelete = isOwner;
  const nameDirty = draftName.trim() !== household.name;
  const nameValid = draftName.trim().length > 0;

  const handleSaveName = () => {
    if (nameValid && nameDirty) renameHousehold(householdId, draftName);
  };

  const handleSetCurrency = (currency: CurrencyCode) => {
    setHouseholdCurrency(householdId, currency);
  };

  const handleLeave = () => {
    removeUserFromHousehold(householdId, currentUserId);
    close();
  };

  const handleDelete = () => {
    deleteHousehold(householdId);
    close();
  };

  const confirmRemoveMember = (member: User) => {
    Alert.alert(
      'Remove member',
      `Remove ${member.name} from ${household.name}? They won't have access to this budget anymore.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeUserFromHousehold(householdId, member.id),
        },
      ],
    );
  };

  const handleEditMember = () => {
    setEditingMember(actionsMember);
    setActionsMember(null);
  };

  const handleRemoveMember = () => {
    const target = actionsMember;
    setActionsMember(null);
    if (target) confirmRemoveMember(target);
  };

  const handleSaveMemberName = (name: string) => {
    if (!editingMember) return;
    updateUser(editingMember.id, { name });
    setEditingMember(null);
  };

  return (
    <Modal
      visible={!!householdId}
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
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>Manage budget</Text>
              <Text style={styles.title} numberOfLines={1}>
                {household.name}
              </Text>
            </View>
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  Members ({members.length})
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.inviteBtn,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    // Invite flow lands with Supabase backend
                  }}
                >
                  <Plus size={14} color={colors.primary} strokeWidth={2.6} />
                  <Text style={styles.inviteLabel}>Invite</Text>
                </Pressable>
              </View>

              {members.map(({ user, role }) => (
                <MemberRow
                  key={user.id}
                  user={user}
                  role={role}
                  isCurrentUser={user.id === currentUserId}
                  canManage={isOwner}
                  onMore={() => setActionsMember(user)}
                />
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Name</Text>
              <View style={styles.nameRow}>
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  style={styles.nameInput}
                  selectionColor={colors.primary}
                  maxLength={48}
                  editable={isOwner}
                />
                {nameDirty && nameValid ? (
                  <Pressable
                    onPress={handleSaveName}
                    style={({ pressed }) => [
                      styles.saveNameBtn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.saveNameLabel}>Save</Text>
                  </Pressable>
                ) : null}
              </View>
              {!isOwner ? (
                <Text style={styles.hint}>
                  Only the owner can rename this budget.
                </Text>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Currency</Text>
              <CurrencyPicker
                value={household.currency}
                onChange={handleSetCurrency}
              />
            </View>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerLabel}>Danger zone</Text>

              {!isOwner ? (
                <Pressable
                  onPress={handleLeave}
                  style={({ pressed }) => [
                    styles.dangerBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <LogOut
                    size={18}
                    color={colors.status.danger}
                    strokeWidth={2.2}
                  />
                  <Text style={styles.dangerBtnLabel}>Leave budget</Text>
                </Pressable>
              ) : null}

              {canDelete ? (
                <Pressable
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.dangerBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Trash2
                    size={18}
                    color={colors.status.danger}
                    strokeWidth={2.2}
                  />
                  <Text style={styles.dangerBtnLabel}>Delete budget</Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <MemberActionsSheet
        member={actionsMember}
        onClose={() => setActionsMember(null)}
        onEdit={handleEditMember}
        onRemove={handleRemoveMember}
      />

      <EditMemberModal
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={handleSaveMemberName}
      />
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
    gap: spacing.md,
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
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.overline,
    color: colors.text.muted,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  inviteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameInput: {
    ...typography.subtitle,
    flex: 1,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  saveNameBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  saveNameLabel: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  hint: {
    ...typography.caption,
    color: colors.text.faint,
    marginTop: spacing.sm,
  },
  dangerZone: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  dangerLabel: {
    ...typography.overline,
    color: colors.status.danger,
    marginBottom: spacing.sm,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 122, 107, 0.08)',
  },
  dangerBtnLabel: {
    ...typography.body,
    color: colors.status.danger,
    fontWeight: '700',
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  LogOut,
  Plus,
  User as UserIcon,
  Users,
} from 'lucide-react-native';

import { SettingsRow, SettingsSection } from '@/components/settings';
import { ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import {
  selectActiveHousehold,
  selectCurrentUser,
  useHouseholdStore,
} from '@/store/householdStore';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const SettingsScreen: React.FC = () => {
  const households = useHouseholdStore((s) => s.households);
  const activeHousehold = useHouseholdStore(selectActiveHousehold);
  const currentUser = useHouseholdStore(selectCurrentUser);
  const memberships = useHouseholdStore((s) => s.memberships);

  const openCreate = useHouseholdEditorStore((s) => s.openCreate);
  const openManage = useHouseholdEditorStore((s) => s.openManage);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your shared budgets and preferences.
        </Text>
      </View>

      {currentUser ? (
        <View style={[styles.profileCard, shadows.card]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accents[currentUser.accent].soft },
            ]}
          >
            <Text
              style={[
                styles.avatarInitial,
                { color: colors.accents[currentUser.accent].base },
              ]}
            >
              {currentUser.initial}
            </Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
          </View>
        </View>
      ) : null}

      <SettingsSection
        title="Shared budgets"
        description="Switch, create, or manage your shared budgets."
      >
        {households.map((h, idx) => {
          const memberCount = memberships.filter(
            (m) => m.householdId === h.id,
          ).length;
          const isActive = activeHousehold?.id === h.id;
          return (
            <SettingsRow
              key={h.id}
              icon={memberCount > 1 ? Users : UserIcon}
              accent={isActive ? 'violet' : undefined}
              label={h.name}
              value={`${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
              onPress={() => openManage(h.id)}
              isLast={idx === households.length - 1}
            />
          );
        })}
      </SettingsSection>

      <Pressable
        onPress={openCreate}
        style={({ pressed }) => [
          styles.createBtn,
          pressed && styles.createPressed,
        ]}
      >
        <Plus size={18} color={colors.primary} strokeWidth={2.6} />
        <Text style={styles.createLabel}>Create new budget</Text>
      </Pressable>

      <SettingsSection title="Preferences">
        <SettingsRow
          icon={Bell}
          accent="sky"
          label="Notifications"
          value="On"
          onPress={() => {
            // Notifications screen lands in a future iteration
          }}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsRow
          icon={UserIcon}
          accent="mint"
          label="Profile"
          onPress={() => {
            // Profile editor lands with Supabase Auth
          }}
        />
        <SettingsRow
          icon={LogOut}
          label="Log out"
          destructive
          showChevron={false}
          onPress={signOut}
          isLast
        />
      </SettingsSection>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  profileEmail: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    marginBottom: spacing.xl,
  },
  createPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  createLabel: {
    ...typography.subtitle,
    color: colors.primary,
  },
});

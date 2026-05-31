import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Globe,
  KeyRound,
  LogOut,
  Plus,
  User as UserIcon,
  Users,
} from 'lucide-react-native';

import { SettingsRow, SettingsSection } from '@/components/settings';
import { ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import { useProfileEditorStore } from '@/store/profileEditorStore';
import {
  selectActiveHousehold,
  selectCurrentUser,
  useHouseholdStore,
} from '@/store/householdStore';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const households = useHouseholdStore((s) => s.households);
  const activeHousehold = useHouseholdStore(selectActiveHousehold);
  const currentUser = useHouseholdStore(selectCurrentUser);
  const memberships = useHouseholdStore((s) => s.memberships);

  const openCreate = useHouseholdEditorStore((s) => s.openCreate);
  const openManage = useHouseholdEditorStore((s) => s.openManage);
  const openProfile = useProfileEditorStore((s) => s.openProfile);
  const openPassword = useProfileEditorStore((s) => s.openPassword);
  const openLanguage = useProfileEditorStore((s) => s.openLanguage);
  const signOut = useAuthStore((s) => s.signOut);

  const currentLangLabel =
    i18n.language === 'es' ? t('language.spanish') : t('language.english');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
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
        title={t('settings.sharedBudgetsTitle')}
        description={t('settings.sharedBudgetsDescription')}
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
              value={t('household.members', { count: memberCount })}
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
        <Text style={styles.createLabel}>
          {t('settings.createNewBudget')}
        </Text>
      </Pressable>

      <SettingsSection title={t('settings.preferencesTitle')}>
        <SettingsRow
          icon={Globe}
          accent="mint"
          label={t('settings.languageRow')}
          value={currentLangLabel}
          onPress={openLanguage}
        />
        <SettingsRow
          icon={Bell}
          accent="sky"
          label={t('settings.notifications')}
          value={t('settings.notificationsOn')}
          onPress={() => {
            // Notifications screen lands in a future iteration
          }}
          isLast
        />
      </SettingsSection>

      <SettingsSection title={t('settings.accountTitle')}>
        <SettingsRow
          icon={UserIcon}
          accent="mint"
          label={t('settings.profile')}
          onPress={openProfile}
        />
        <SettingsRow
          icon={KeyRound}
          accent="violet"
          label={t('settings.changePassword')}
          onPress={openPassword}
        />
        <SettingsRow
          icon={LogOut}
          label={t('settings.logOut')}
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

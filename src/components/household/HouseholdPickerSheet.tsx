import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Plus, Settings2, User, Users } from 'lucide-react-native';

import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import {
  selectMembersByHousehold,
  useHouseholdStore,
} from '@/store/householdStore';
import { colors, radius, spacing, typography } from '@/theme';

export const HouseholdPickerSheet: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isOpen = useHouseholdEditorStore((s) => s.pickerOpen);
  const close = useHouseholdEditorStore((s) => s.closePicker);
  const openCreate = useHouseholdEditorStore((s) => s.openCreate);
  const openManage = useHouseholdEditorStore((s) => s.openManage);

  const households = useHouseholdStore((s) => s.households);
  const activeId = useHouseholdStore((s) => s.activeHouseholdId);
  const setActive = useHouseholdStore((s) => s.setActiveHousehold);
  const memberships = useHouseholdStore((s) => s.memberships);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>{t('household.sharedBudgets')}</Text>
          <Text style={styles.subtitle}>{t('household.pickerSubtitle')}</Text>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {households.map((h) => {
              const isActive = h.id === activeId;
              const memberCount = memberships.filter(
                (m) => m.householdId === h.id,
              ).length;
              const HouseholdIcon = memberCount > 1 ? Users : User;

              return (
                <Pressable
                  key={h.id}
                  onPress={() => {
                    setActive(h.id);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    isActive && styles.rowActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.rowIcon,
                      isActive && { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <HouseholdIcon
                      size={18}
                      color={isActive ? colors.primary : colors.text.muted}
                      strokeWidth={2.4}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{h.name}</Text>
                    <Text style={styles.rowMeta}>
                      {t('household.members', { count: memberCount })}
                      {' · '}
                      {h.currency}
                    </Text>
                  </View>
                  {isActive ? (
                    <Check size={20} color={colors.primary} strokeWidth={2.8} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={openCreate}
              style={({ pressed }) => [
                styles.action,
                styles.actionPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Plus size={18} color={colors.onPrimary} strokeWidth={2.6} />
              <Text style={styles.actionPrimaryLabel}>
                {t('household.createNew')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openManage(activeId)}
              style={({ pressed }) => [
                styles.action,
                styles.actionGhost,
                pressed && styles.pressed,
              ]}
            >
              <Settings2 size={18} color={colors.primary} strokeWidth={2.4} />
              <Text style={styles.actionGhostLabel}>
                {t('household.manageCurrent')}
              </Text>
            </Pressable>
          </View>
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
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.lg,
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowActive: {
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  rowMeta: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionPrimaryLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
  },
  actionGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionGhostLabel: {
    ...typography.subtitle,
    color: colors.primary,
  },
});

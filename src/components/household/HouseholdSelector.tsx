import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, User, Users } from 'lucide-react-native';

import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import {
  selectActiveHousehold,
  useHouseholdStore,
} from '@/store/householdStore';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const HouseholdSelector: React.FC = () => {
  const household = useHouseholdStore(selectActiveHousehold);
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const memberships = useHouseholdStore((s) => s.memberships);
  const openPicker = useHouseholdEditorStore((s) => s.openPicker);

  const memberCount = memberships.filter(
    (m) => m.householdId === activeHouseholdId,
  ).length;

  if (!household) return null;

  return (
    <Pressable
      onPress={openPicker}
      style={({ pressed }) => [
        styles.btn,
        shadows.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        {memberCount > 1 ? (
          <Users size={20} color={colors.onPrimary} strokeWidth={2.4} />
        ) : (
          <User size={20} color={colors.onPrimary} strokeWidth={2.4} />
        )}
      </View>

      <View style={styles.text}>
        <Text style={styles.eyebrow}>Active budget</Text>
        <Text style={styles.name} numberOfLines={1}>
          {household.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{household.currency}</Text>
        </View>
      </View>

      <View style={styles.chevronWrap}>
        <ChevronDown size={18} color={colors.primary} strokeWidth={2.6} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: 2,
  },
  name: {
    ...typography.title,
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.text.faint,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

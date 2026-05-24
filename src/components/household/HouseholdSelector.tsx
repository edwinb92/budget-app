import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, Users } from 'lucide-react-native';

import { useHouseholdEditorStore } from '@/store/householdEditorStore';
import {
  selectActiveHousehold,
  selectActiveHouseholdMembers,
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
        <Users size={18} color={colors.primary} strokeWidth={2.4} />
      </View>

      <View style={styles.text}>
        <Text style={styles.eyebrow}>Active budget</Text>
        <Text style={styles.name} numberOfLines={1}>
          {household.name}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.memberCount}>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </Text>
        <ChevronDown size={18} color={colors.text.muted} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: 2,
  },
  name: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberCount: {
    ...typography.caption,
    color: colors.text.faint,
    fontWeight: '600',
  },
});

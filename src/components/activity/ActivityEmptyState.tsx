import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Receipt } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const ActivityEmptyState: React.FC = () => {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Receipt size={32} color={colors.primary} strokeWidth={2.2} />
      </View>
      <Text style={styles.title}>No expenses yet</Text>
      <Text style={styles.subtitle}>
        Tap the + button to add your first expense.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
});

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useMutationStore } from '@/store/mutationStore';
import { colors, radius, shadows, spacing, typography } from '@/theme';

// Overlay full-screen con dim + spinner centrado mientras hay
// cualquier mutación en vuelo. Bloquea taps para evitar dobles
// acciones accidentales.
export const MutationIndicator: React.FC = () => {
  const isPending = useMutationStore((s) => s.pendingCount > 0);

  if (!isPending) return null;

  return (
    <View style={styles.backdrop}>
      <View style={[styles.card, shadows.card]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.label}>Saving...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(31, 34, 48, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  label: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
});

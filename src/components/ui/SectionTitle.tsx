import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface SectionTitleProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={12}
          style={({ pressed }) => [pressed && styles.actionPressed]}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  action: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  actionPressed: {
    opacity: 0.6,
  },
});

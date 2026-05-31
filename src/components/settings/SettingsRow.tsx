import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';

import { AccentName, colors, radius, spacing, typography } from '@/theme';

interface SettingsRowProps {
  icon: LucideIcon;
  accent?: AccentName;
  label: string;
  value?: string;
  showChevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  isLast?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon: Icon,
  accent,
  label,
  value,
  showChevron = true,
  destructive = false,
  onPress,
  isLast = false,
}) => {
  const accentColor = accent ? colors.accents[accent] : null;
  const labelColor = destructive ? colors.status.danger : colors.text.primary;
  const iconColor = destructive
    ? colors.status.danger
    : accentColor?.base ?? colors.primary;
  const iconBg = destructive
    ? 'rgba(220, 38, 38, 0.12)'
    : accentColor?.soft ?? colors.primarySoft;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} strokeWidth={2.4} />
      </View>

      <View style={styles.text}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>

      {value ? <Text style={styles.value}>{value}</Text> : null}
      {showChevron && onPress && !destructive ? (
        <ChevronRight
          size={18}
          color={colors.text.faint}
          strokeWidth={2.4}
        />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  value: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
});

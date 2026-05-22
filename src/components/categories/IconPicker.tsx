import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CATEGORY_ICONS, ICON_KEYS } from '@/data/icons';
import { AccentName, colors, radius, spacing } from '@/theme';

interface IconPickerProps {
  value: string;
  accent: AccentName;
  onChange: (key: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  accent,
  onChange,
}) => {
  const accentColor = colors.accents[accent];

  return (
    <View style={styles.grid}>
      {ICON_KEYS.map((key) => {
        const Icon = CATEGORY_ICONS[key]!;
        const selected = key === value;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={({ pressed }) => [
              styles.tile,
              selected && {
                backgroundColor: accentColor.soft,
                borderColor: accentColor.base,
              },
              pressed && styles.pressed,
            ]}
          >
            <Icon
              size={20}
              color={selected ? accentColor.base : colors.text.muted}
              strokeWidth={2.2}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});

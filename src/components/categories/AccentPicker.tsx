import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

import { AccentName, colors, radius, spacing } from '@/theme';

interface AccentPickerProps {
  value: AccentName;
  onChange: (accent: AccentName) => void;
}

// Derivado del theme: si agregás un accent en colors.accents aparece acá.
const ACCENT_KEYS = Object.keys(colors.accents) as AccentName[];

export const AccentPicker: React.FC<AccentPickerProps> = ({ value, onChange }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ACCENT_KEYS.map((key) => {
        const accent = colors.accents[key];
        const selected = key === value;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={({ pressed }) => [
              styles.swatch,
              { backgroundColor: accent.base },
              selected && styles.swatchSelected,
              pressed && styles.pressed,
            ]}
          >
            {selected ? (
              <Check size={16} color={colors.onPrimary} strokeWidth={3} />
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.text.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});

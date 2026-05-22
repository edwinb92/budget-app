import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { AccentName, colors, radius, spacing } from '@/theme';

interface AccentPickerProps {
  value: AccentName;
  onChange: (accent: AccentName) => void;
}

const ACCENT_KEYS: AccentName[] = ['violet', 'coral', 'amber', 'mint', 'sky', 'rose'];

export const AccentPicker: React.FC<AccentPickerProps> = ({ value, onChange }) => {
  return (
    <View style={styles.row}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
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

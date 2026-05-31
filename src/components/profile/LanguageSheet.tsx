import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Globe, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { changeAppLanguage, getCurrentLanguage, SupportedLanguage } from '@/i18n';
import { useProfileEditorStore } from '@/store/profileEditorStore';
import { colors, radius, spacing, typography } from '@/theme';

const LANGUAGE_OPTIONS: Array<{
  code: SupportedLanguage;
  labelKey: 'english' | 'spanish';
}> = [
  { code: 'en', labelKey: 'english' },
  { code: 'es', labelKey: 'spanish' },
];

export const LanguageSheet: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isOpen = useProfileEditorStore((s) => s.languageOpen);
  const close = useProfileEditorStore((s) => s.closeLanguage);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(
    getCurrentLanguage(),
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedLang(getCurrentLanguage());
    }
  }, [isOpen]);

  const handleSelect = async (lang: SupportedLanguage) => {
    if (lang === selectedLang) {
      close();
      return;
    }
    setSelectedLang(lang);
    await changeAppLanguage(lang);
    close();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>{t('language.title')}</Text>
              <Text style={styles.title}>{t('language.subtitle')}</Text>
            </View>
            <Pressable
              onPress={close}
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <X size={18} color={colors.text.primary} strokeWidth={2.4} />
            </Pressable>
          </View>

          {LANGUAGE_OPTIONS.map((option) => {
            const selected = option.code === selectedLang;
            return (
              <Pressable
                key={option.code}
                onPress={() => handleSelect(option.code)}
                style={({ pressed }) => [
                  styles.languageRow,
                  selected && styles.languageRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.languageIcon,
                    selected && styles.languageIconSelected,
                  ]}
                >
                  <Globe
                    size={18}
                    color={selected ? colors.onPrimary : colors.primary}
                    strokeWidth={2.4}
                  />
                </View>
                <Text
                  style={[
                    styles.languageLabel,
                    selected && styles.languageLabelSelected,
                  ]}
                >
                  {t(`language.${option.labelKey}`)}
                </Text>
              </Pressable>
            );
          })}
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
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: 2,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  languageRowSelected: {
    backgroundColor: colors.primarySoft,
  },
  languageIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageIconSelected: {
    backgroundColor: colors.primary,
  },
  languageLabel: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  languageLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});

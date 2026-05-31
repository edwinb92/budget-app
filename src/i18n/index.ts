import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

const STORAGE_KEY = 'app.language';
const FALLBACK = 'en';
const SUPPORTED = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED)[number];

const detectDeviceLanguage = (): SupportedLanguage => {
  try {
    const locale = getLocales()[0]?.languageCode ?? FALLBACK;
    return SUPPORTED.includes(locale as SupportedLanguage)
      ? (locale as SupportedLanguage)
      : FALLBACK;
  } catch {
    return FALLBACK;
  }
};

// Inicializa i18next sincrónicamente con el idioma del device, y
// luego (async) sobreescribe con la preferencia guardada del usuario.
export const initI18n = async (): Promise<void> => {
  const deviceLang = detectDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: deviceLang,
    fallbackLng: FALLBACK,
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });

  // Si el user ya eligió un idioma en sesiones anteriores, lo usamos.
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored as SupportedLanguage)) {
      await i18n.changeLanguage(stored);
    }
  } catch {
    // Si AsyncStorage falla, seguimos con el idioma detectado.
  }
};

export const changeAppLanguage = async (lang: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Si no persiste, al menos se aplica durante la sesión actual.
  }
};

export const getCurrentLanguage = (): SupportedLanguage =>
  (i18n.language as SupportedLanguage) ?? FALLBACK;

export { SUPPORTED };
export default i18n;

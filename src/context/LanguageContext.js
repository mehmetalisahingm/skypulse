import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { translations } from '../constants/strings';

export const LanguageContext = createContext();

export const i18n = new I18n();
i18n.translations = translations;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLocale = await AsyncStorage.getItem('@language');
        if (storedLocale) {
          setLocale(storedLocale);
          i18n.locale = storedLocale;
        } else {
          const deviceLocales = Localization.getLocales();
          if (deviceLocales && deviceLocales.length > 0) {
            const deviceLanguage = deviceLocales[0].languageCode;
            const validLocale = deviceLanguage === 'tr' ? 'tr' : 'en';
            setLocale(validLocale);
            i18n.locale = validLocale;
          } else {
            i18n.locale = 'en';
          }
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (newLocale) => {
    try {
      setLocale(newLocale);
      i18n.locale = newLocale;
      await AsyncStorage.setItem('@language', newLocale);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t: i18n.t.bind(i18n) }}>
      {children}
    </LanguageContext.Provider>
  );
};

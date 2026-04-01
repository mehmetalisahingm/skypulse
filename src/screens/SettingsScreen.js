import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { ScreenWrapper } from '../components/ScreenWrapper';

export const SettingsScreen = () => {
  const { colors, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { locale, changeLanguage, t } = useContext(LanguageContext);

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>{t('settings.darkMode')}</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>{t('settings.language')}</Text>
            <View style={styles.langRow}>
              <TouchableOpacity
                style={[styles.langBtn, locale === 'en' && { backgroundColor: colors.accent }]}
                onPress={() => changeLanguage('en')}
              >
                <Text style={[styles.langText, locale === 'en' ? { color: '#FFF' } : { color: colors.text }]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, locale === 'tr' && { backgroundColor: colors.accent }]}
                onPress={() => changeLanguage('tr')}
              >
                <Text style={[styles.langText, locale === 'tr' ? { color: '#FFF' } : { color: colors.text }]}>TR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  langRow: {
    flexDirection: 'row',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  langText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});

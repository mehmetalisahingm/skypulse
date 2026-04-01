import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

const SmartAssistant = ({ current }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  if (!current) return null;

  const temp = current.main.temp;
  const condition = current.weather[0].main.toLowerCase();

  let adviceKey = 'perfect';
  if (temp < 10 && (condition.includes('rain') || condition.includes('drizzle'))) adviceKey = 'coldRain';
  else if (temp > 25 && condition.includes('clear')) adviceKey = 'hotSun';
  else if (temp < 15) adviceKey = 'cold';
  else if (condition.includes('rain') || condition.includes('thunderstorm')) adviceKey = 'rain';
  else if (condition.includes('snow')) adviceKey = 'snow';

  return (
    <View style={[{ backgroundColor: colors.secondaryCard }, styles.container]}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={20} color={colors.accent} style={styles.icon} />
        <Text style={[styles.title, { color: colors.text }]}>{t('assistant.title')}</Text>
      </View>
      <Text style={[styles.advice, { color: colors.textSecondary }]}>
        {t(`assistant.${adviceKey}`)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  advice: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SmartAssistant;

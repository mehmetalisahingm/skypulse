import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export const ErrorState = ({ messageKey, onRetry }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text style={[styles.message, { color: colors.text }]}>
        {t(`errors.${messageKey}`)}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.accent }]} 
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>{t('errors.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: 'Inter-Medium',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});

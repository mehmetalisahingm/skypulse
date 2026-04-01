import React, { useContext } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';

export const ScreenWrapper = ({ children, condition }) => {
  const { colors } = useContext(ThemeContext);

  const getGradientColors = (cond) => {
    if (!cond) return [colors.background, colors.background];
    
    const main = cond.toLowerCase();
    if (main.includes('clear')) return ['#FFB75E', '#ED8F03'];
    if (main.includes('cloud')) return ['#bdc3c7', '#2c3e50'];
    if (main.includes('rain') || main.includes('drizzle')) return ['#2980b9', '#1a2a6c'];
    if (main.includes('snow')) return ['#E0EAFC', '#CFDEF3'];
    if (main.includes('thunderstorm') || main.includes('thunder')) return ['#4b1248', '#F0C27B'];
    
    return [colors.background, colors.background];
  };

  const isWeatherGradient = !!condition;
  
  return (
    <View style={styles.container}>
      {isWeatherGradient ? (
        <LinearGradient
          colors={getGradientColors(condition)}
          style={StyleSheet.absoluteFillObject}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

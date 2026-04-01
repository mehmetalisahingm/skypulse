import React, { useContext, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const WeatherCard = ({ data }) => {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 500 });
  }, [data]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!data || !data.main) return null;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(22, 33, 62, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderColor: colors.border }]}>
      <Text style={[styles.cityName, { color: colors.text }]}>{data.name}</Text>
      
      <Reanimated.View style={[styles.iconContainer, animatedStyle]}>
        <Image 
          source={{ uri: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png` }} 
          style={styles.icon} 
        />
      </Reanimated.View>
      
      <Text style={[styles.temp, { color: colors.text }]}>
        {Math.round(data.main.temp)}°C
      </Text>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {data.weather[0].description}
      </Text>

      <View style={[styles.detailsRow, { borderTopColor: 'rgba(0,0,0,0.1)' }]}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('home.feelsLike')}</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{Math.round(data.main.feels_like)}°C</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('home.humidity')}</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{data.main.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('home.wind')}</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{data.wind.speed} m/s</Text>
        </View>
      </View>

      {data.sys && data.sys.sunrise && (
        <View style={{flexDirection:'row', justifyContent:'space-around', width:'100%', borderTopWidth:1, borderTopColor:'rgba(0,0,0,0.1)', paddingTop:16, marginTop: 16}}>
          <View style={{alignItems:'center'}}>
            <Ionicons name="sunny-outline" size={24} color={colors.accent} style={{marginBottom:4}} />
            <Text style={[{fontSize:12, fontFamily:'Inter-Regular', marginBottom:2}, { color: colors.textSecondary }]}>{t('home.sunrise')}</Text>
            <Text style={[{fontSize:14, fontFamily:'Inter-SemiBold'}, { color: colors.text }]}>{new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</Text>
          </View>
          <View style={{alignItems:'center'}}>
            <Ionicons name="moon-outline" size={24} color={colors.accent} style={{marginBottom:4}} />
            <Text style={[{fontSize:12, fontFamily:'Inter-Regular', marginBottom:2}, { color: colors.textSecondary }]}>{t('home.sunset')}</Text>
            <Text style={[{fontSize:14, fontFamily:'Inter-SemiBold'}, { color: colors.text }]}>{new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cityName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  iconContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  temp: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    marginVertical: 8,
  },
  description: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});

export default WeatherCard;

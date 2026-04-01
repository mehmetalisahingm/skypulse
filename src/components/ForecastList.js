import React, { useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const ForecastList = ({ forecast }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  
  if (!forecast || !forecast.list) return null;

  const hourlyData = forecast.list.slice(0, 8); // Next 24 hours (8 intervals of 3 hours)

  const renderItem = ({ item }) => {
    const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <View style={[styles.itemContainer, { backgroundColor: colors.secondaryCard }]}>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>{time}</Text>
        <Image 
          source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png` }} 
          style={styles.icon} 
        />
        <Text style={[styles.tempText, { color: colors.text }]}>{Math.round(item.main.temp)}°</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('forecast.title')}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={hourlyData}
        keyExtractor={i => i.dt.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 0,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 12,
  },
  itemContainer: {
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    width: 80,
  },
  timeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    marginBottom: 4,
  },
  icon: {
    width: 40,
    height: 40,
  },
  tempText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginTop: 4,
  },
});

export default ForecastList;

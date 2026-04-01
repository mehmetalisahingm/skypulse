import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { useWeather } from '../hooks/useWeather';
import { Ionicons } from '@expo/vector-icons';

const FavoritesScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const { getWeatherByCity } = useWeather();
  const [loadingId, setLoadingId] = useState(null);

  const handleFavoriteClick = async (item) => {
    setLoadingId(item.id);
    try {
      const data = await getWeatherByCity(item.name);
      if (data) {
        navigation.navigate('SearchTab', { screen: 'WeatherDetail', params: { cityData: data } });
      }
    } catch (e) {
      // Error is handled implicitly or you can display a toast
    } finally {
      setLoadingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleFavoriteClick(item)}
      disabled={loadingId === item.id}
    >
      <View style={styles.infoContainer}>
        <Text style={[styles.cityName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.tempContainer}>
          {loadingId === item.id ? (
            <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 8 }} />
          ) : (
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png` }}
              style={styles.icon}
            />
          )}
          <Text style={[styles.temp, { color: colors.textSecondary }]}>{Math.round(item.main.temp)}°C</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeFavorite(item.id)}>
        <Ionicons name="trash-outline" size={24} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('favorites.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  temp: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
  },
});

export default FavoritesScreen;

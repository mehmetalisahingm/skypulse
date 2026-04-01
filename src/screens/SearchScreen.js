import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { useWeather } from '../hooks/useWeather';
import { Ionicons } from '@expo/vector-icons';

const SearchScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const [query, setQuery] = useState('');
  const { weatherData, loading, error, getWeatherByCity } = useWeather();
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const data = await getWeatherByCity(query);
      if (data) {
        setResults([data]);
      }
    } catch (e) {
      setResults([]);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('WeatherDetail', { cityData: item })}
    >
      <View>
        <Text style={[styles.cityName, { color: colors.text }]}>{item.current.name}</Text>
        <Text style={[styles.weatherDesc, { color: colors.textSecondary }]}>
          {item.current.weather[0].description}
        </Text>
      </View>
      <View style={styles.tempContainer}>
        <Text style={[styles.temp, { color: colors.text }]}>{Math.round(item.current.main.temp)}°C</Text>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${item.current.weather[0].icon}.png` }}
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[{ flex: 1, padding: 16 }, { backgroundColor: colors.background }]}>
      <View style={styles.searchRow}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.accent }]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>{t('search.button')}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />}
      
      {!loading && error === 'cityNotFound' && (
        <Text style={[styles.errorText, { color: colors.error }]}>{t('search.noResults')}</Text>
      )}

      {!loading && !error && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.current.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cityName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temp: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginRight: 8,
  },
  icon: {
    width: 40,
    height: 40,
  },
  errorText: {
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    marginTop: 24,
    fontSize: 16,
  },
});

export default SearchScreen;

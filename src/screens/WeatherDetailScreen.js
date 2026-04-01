import React, { useContext, useLayoutEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { FavoritesContext } from '../context/FavoritesContext';
import ScreenWrapper from '../components/ScreenWrapper';
import WeatherCard from '../components/WeatherCard';
import SmartAssistant from '../components/SmartAssistant';
import ForecastList from '../components/ForecastList';
import { Ionicons } from '@expo/vector-icons';

const WeatherDetailScreen = ({ route, navigation }) => {
  const { cityData } = route.params; // { current, forecast }
  const { colors } = useContext(ThemeContext);
  const { isFavorite, addFavorite, removeFavorite } = useContext(FavoritesContext);
  
  const favorite = isFavorite(cityData.current.id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: cityData.current.name,
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 16 }} 
          onPress={() => favorite ? removeFavorite(cityData.current.id) : addFavorite(cityData.current)}
        >
          <Ionicons 
            name={favorite ? "star" : "star-outline"} 
            size={24} 
            color={favorite ? colors.accent : colors.text} 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, favorite, colors, cityData]);

  if (!cityData || !cityData.current) return null;

  return (
    <ScreenWrapper condition={cityData.current.weather[0]?.main}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <WeatherCard data={cityData.current} />
        <SmartAssistant current={cityData.current} />
        <ForecastList forecast={cityData.forecast} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default WeatherDetailScreen;

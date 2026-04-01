import React, { useEffect, useLayoutEffect, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { useLocation } from '../hooks/useLocation';
import { useWeather } from '../hooks/useWeather';
import ScreenWrapper from '../components/ScreenWrapper';
import WeatherCard from '../components/WeatherCard';
import SmartAssistant from '../components/SmartAssistant';
import ForecastList from '../components/ForecastList';
import LiveClock from '../components/LiveClock';
import ErrorState from '../components/ErrorState';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

const HomeScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { location, errorMsg, loading: locLoading, requestLocation } = useLocation();
  const { weatherData, loading: weatherLoading, error: weatherError, getWeatherByCoords } = useWeather();
  const { t } = useContext(LanguageContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <LiveClock />,
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors.text]);

  const loadWeather = () => {
    if (location) {
      getWeatherByCoords(location.coords.latitude, location.coords.longitude);
    }
  };

  useEffect(() => {
    if (location && !weatherData && !weatherError) {
      loadWeather();
    }
  }, [location]);

  if (locLoading || (weatherLoading && !weatherData)) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (errorMsg) {
    return <ErrorState messageKey={errorMsg} onRetry={requestLocation} />;
  }

  if (weatherError && !weatherData) {
    return <ErrorState messageKey={weatherError} onRetry={loadWeather} />;
  }

  if (!weatherData || !weatherData.current) {
    return <View style={[{flex:1}, {backgroundColor: colors.background}]} />;
  }

  return (
    <ScreenWrapper condition={weatherData.current.weather[0]?.main}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={weatherLoading} 
            onRefresh={loadWeather} 
            tintColor={colors.accent} 
          />
        }
      >
        <WeatherCard data={weatherData.current} />
        <SmartAssistant current={weatherData.current} />
        <ForecastList forecast={weatherData.forecast} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});

export default HomeScreen;

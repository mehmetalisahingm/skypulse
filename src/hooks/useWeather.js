import { useState, useCallback } from 'react';
import { fetchWeatherByCoords, fetchWeatherByCity } from '../services/weatherService';

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeatherByCoords = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCoords(lat, lon);
      setWeatherData(data);
      return data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('cityNotFound');
      } else {
        setError('generic');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWeatherByCity = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCity(city);
      setWeatherData(data);
      return data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('cityNotFound');
      } else {
        setError('generic');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    weatherData,
    loading,
    error,
    getWeatherByCoords,
    getWeatherByCity,
  };
};

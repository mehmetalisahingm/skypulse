import axios from 'axios';

const API_KEY = '34840d0d17751d6b70de7a2bbda86a0d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const fetchWeatherByCoords = async (lat, lon) => {
  const [curr, fore] = await Promise.all([
    apiClient.get('/weather', { params: { lat, lon, appid: API_KEY, units: 'metric' } }),
    apiClient.get('/forecast', { params: { lat, lon, appid: API_KEY, units: 'metric' } })
  ]);
  return { current: curr.data, forecast: fore.data };
};

export const fetchWeatherByCity = async (city) => {
  const [curr, fore] = await Promise.all([
    apiClient.get('/weather', { params: { q: city, appid: API_KEY, units: 'metric' } }),
    apiClient.get('/forecast', { params: { q: city, appid: API_KEY, units: 'metric' } })
  ]);
  return { current: curr.data, forecast: fore.data };
};

export const fetchWeatherById = async (id) => {
  const response = await apiClient.get('/weather', {
    params: {
      id,
      appid: API_KEY,
      units: 'metric',
    },
  });
  return response.data;
};

import React, { useState, useEffect, useContext, useCallback, useRef, useLayoutEffect, createContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView, RefreshControl, Switch, Animated, SafeAreaView } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreenAsync from 'expo-splash-screen';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

SplashScreenAsync.preventAutoHideAsync().catch(() => {});

// --- CONSTANTS ---
const API_KEY = '34840d0d17751d6b70de7a2bbda86a0d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const lightColors = {
  background: '#F0F4F8', card: '#FFFFFF', text: '#1A1A2E',
  textSecondary: '#666666', border: '#E2E8F0', accent: '#2D6A4F',
  error: '#EF4444', success: '#10B981', secondaryCard: 'rgba(0,0,0,0.05)'
};
const darkColors = {
  background: '#1A1A2E', card: '#16213E', text: '#FFFFFF',
  textSecondary: '#A0AEC0', border: '#2D3748', accent: '#E94560',
  error: '#F87171', success: '#34D399', secondaryCard: 'rgba(255,255,255,0.08)'
};

const translations = {
  en: {
    tabs: { home: "Home", search: "Search", favorites: "Favorites" },
    home: { feelsLike: "Feels like", humidity: "Humidity", wind: "Wind", pullToRefresh: "Pull to refresh", sunrise: "Sunrise", sunset: "Sunset" },
    search: { placeholder: "Search city...", button: "Search", noResults: "No results found" },
    favorites: { title: "Saved Cities", empty: "No saved cities yet.", saveButton: "Save to Favorites", removeButton: "Remove from Favorites" },
    settings: { title: "Settings", darkMode: "Dark Mode", language: "Language" },
    errors: { noInternet: "No internet connection.", cityNotFound: "City not found.", locationDenied: "Location permission denied.", generic: "Something went wrong.", retry: "Retry" },
    assistant: { title: "Smart Assistant", coldRain: "It's cold & rainy! Wear a heavy waterproof coat and grab an umbrella.", hotSun: "Hot & sunny today. Wear light clothes, sunglasses and use sunscreen!", cold: "Quite brisk outside. A warm jacket or coat is highly recommended.", rain: "It's raining. An umbrella or raincoat is a must.", snow: "It's snowing! Bundle up with a heavy coat, gloves, and a scarf.", perfect: "Beautiful weather! Comfortable clothes will be perfect." },
    forecast: { title: "Hourly Forecast" }
  },
  tr: {
    tabs: { home: "Ana Sayfa", search: "Arama", favorites: "Favoriler" },
    home: { feelsLike: "Hissedilen", humidity: "Nem", wind: "Rüzgar", pullToRefresh: "Yenilemek için çekin", sunrise: "Gündoğumu", sunset: "Günbatımı" },
    search: { placeholder: "Şehir ara...", button: "Ara", noResults: "Sonuç bulunamadı" },
    favorites: { title: "Kayıtlı Şehirler", empty: "Henüz kayıtlı şehir yok.", saveButton: "Favorilere Kaydet", removeButton: "Favorilerden Çıkar" },
    settings: { title: "Ayarlar", darkMode: "Karanlık Mod", language: "Dil" },
    errors: { noInternet: "İnternet bağlantısı yok.", cityNotFound: "Şehir bulunamadı.", locationDenied: "Konum izni reddedildi.", generic: "Bir hata oluştu.", retry: "Tekrar Dene" },
    assistant: { title: "Akıllı Asistan", coldRain: "Hava soğuk ve yağmurlu! Su geçirmez kalın bir kaban giy ve şemsiyeni al.", hotSun: "Bugün sıcak ve güneşli. İnce kıyafetler, güneş gözlüğü tercih et ve krem sürmeyi unutma!", cold: "Dışarısı oldukça serin. Kalın bir mont ya da kaban giymen tavsiye edilir.", rain: "Yağmur yağıyor. Şemsiye veya yağmurluk alman şart.", snow: "Kar yağıyor! Sıkı giyin; kalın kaban, eldiven ve atkını unutma.", perfect: "Hava harika! Rahat edeceğin ince kıyafetler yeterli." },
    forecast: { title: "Saatlik Tahmin" }
  }
};

// --- SERVICES ---
const apiClient = axios.create({ baseURL: BASE_URL, timeout: 10000 });
const fetchWeatherByCoords = async (lat, lon) => {
  const [curr, fore] = await Promise.all([
    apiClient.get('/weather', { params: { lat, lon, appid: API_KEY, units: 'metric' } }),
    apiClient.get('/forecast', { params: { lat, lon, appid: API_KEY, units: 'metric' } })
  ]);
  return { current: curr.data, forecast: fore.data };
};
const fetchWeatherByCity = async (city) => {
  const [curr, fore] = await Promise.all([
    apiClient.get('/weather', { params: { q: city, appid: API_KEY, units: 'metric' } }),
    apiClient.get('/forecast', { params: { q: city, appid: API_KEY, units: 'metric' } })
  ]);
  return { current: curr.data, forecast: fore.data };
};

// --- HOOKS ---
const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestLocation = async () => {
    setLoading(true); setErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return setErrorMsg('locationDenied');
      setLocation(await Location.getCurrentPositionAsync({}));
    } catch (e) { setErrorMsg('generic'); } finally { setLoading(false); }
  };
  useEffect(() => { requestLocation(); }, []);
  return { location, errorMsg, loading, requestLocation };
};

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const getWeatherByCoords = useCallback(async (lat, lon) => {
    setLoading(true); setError(null);
    try { setWeatherData(await fetchWeatherByCoords(lat, lon)); }
    catch (e) { setError(e.response?.status === 404 ? 'cityNotFound' : 'generic'); }
    finally { setLoading(false); }
  }, []);
  const getWeatherByCity = useCallback(async (city) => {
    setLoading(true); setError(null);
    try { const data = await fetchWeatherByCity(city); setWeatherData(data); return data; }
    catch (e) { setError(e.response?.status === 404 ? 'cityNotFound' : 'generic'); throw e; }
    finally { setLoading(false); }
  }, []);
  return { weatherData, loading, error, getWeatherByCoords, getWeatherByCity };
};

// --- CONTEXTS ---
const ThemeContext = createContext();
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem('@dark_mode').then(val => val !== null && setIsDarkMode(JSON.parse(val))).catch(()=>{});
  }, []);
  const toggleTheme = async () => {
    setIsDarkMode(!isDarkMode);
    await AsyncStorage.setItem('@dark_mode', JSON.stringify(!isDarkMode)).catch(()=>{});
  };
  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors: isDarkMode ? darkColors : lightColors }}>{children}</ThemeContext.Provider>;
};

const LanguageContext = createContext();
const i18n = new I18n();
i18n.translations = translations;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';
const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  useEffect(() => {
    AsyncStorage.getItem('@language').then(val => {
      if (val) { setLocale(val); i18n.locale = val; }
      else {
        const deviceLocales = Localization.getLocales();
        const devLocale = deviceLocales && deviceLocales.length > 0 ? deviceLocales[0].languageCode : 'en';
        const valid = devLocale === 'tr' ? 'tr' : 'en';
        setLocale(valid); i18n.locale = valid;
      }
    }).catch(()=>{});
  }, []);
  const changeLanguage = async (newLocale) => {
    setLocale(newLocale); i18n.locale = newLocale;
    await AsyncStorage.setItem('@language', newLocale).catch(()=>{});
  };
  return <LanguageContext.Provider value={{ locale, changeLanguage, t: i18n.t.bind(i18n) }}>{children}</LanguageContext.Provider>;
};

const FavoritesContext = createContext();
const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    AsyncStorage.getItem('@favorites').then(val => val !== null && setFavorites(JSON.parse(val))).catch(()=>{});
  }, []);
  const addFavorite = async (cityDataCurrent) => {
    if (favorites.some(f => f.id === cityDataCurrent.id)) return;
    const upd = [...favorites, cityDataCurrent];
    setFavorites(upd); await AsyncStorage.setItem('@favorites', JSON.stringify(upd)).catch(()=>{});
  };
  const removeFavorite = async (id) => {
    const upd = favorites.filter(f => f.id !== id);
    setFavorites(upd); await AsyncStorage.setItem('@favorites', JSON.stringify(upd)).catch(()=>{});
  };
  const isFavorite = (id) => favorites.some(f => f.id === id);
  return <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>{children}</FavoritesContext.Provider>;
};

// --- COMPONENTS ---
const ErrorState = ({ messageKey, onRetry }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  return (
    <View style={[{flex:1, justifyContent:'center', alignItems:'center', padding:24}, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text style={[{fontSize:18, textAlign:'center', marginTop:16, marginBottom:24, fontFamily:'Inter-Medium'}, { color: colors.text }]}>
        {t(`errors.${messageKey}`)}
      </Text>
      {onRetry && (
        <TouchableOpacity style={[{paddingHorizontal:24, paddingVertical:12, borderRadius:8}, { backgroundColor: colors.accent }]} onPress={onRetry}>
          <Text style={{color:'#FFF', fontSize:16, fontFamily:'Inter-SemiBold'}}>{t('errors.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const SmartAssistant = ({ current }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  if (!current) return null;

  const temp = current.main.temp;
  const condition = current.weather[0].main.toLowerCase();

  let adviceKey = 'perfect';
  if (temp < 10 && (condition.includes('rain') || condition.includes('drizzle'))) adviceKey = 'coldRain';
  else if (temp > 25 && condition.includes('clear')) adviceKey = 'hotSun';
  else if (temp < 15) adviceKey = 'cold';
  else if (condition.includes('rain') || condition.includes('thunderstorm')) adviceKey = 'rain';
  else if (condition.includes('snow')) adviceKey = 'snow';

  return (
    <View style={{ backgroundColor: colors.secondaryCard, margin: 16, marginTop: 0, padding: 16, borderRadius: 16, borderWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name="sparkles" size={20} color={colors.accent} style={{ marginRight: 8 }} />
        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text }}>{t('assistant.title')}</Text>
      </View>
      <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
        {t(`assistant.${adviceKey}`)}
      </Text>
    </View>
  );
};

const ForecastList = ({ forecast }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  if (!forecast || !forecast.list) return null;

  const hourlyData = forecast.list.slice(0, 8);

  const renderItem = ({ item }) => {
    const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <View style={{ alignItems: 'center', marginRight: 12, backgroundColor: colors.secondaryCard, padding: 12, borderRadius: 12, width: 80 }}>
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>{time}</Text>
        <Image source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png` }} style={{ width: 40, height: 40 }} />
        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text, marginTop: 4 }}>{Math.round(item.main.temp)}°</Text>
      </View>
    );
  };

  return (
    <View style={{ margin: 16, marginTop: 0 }}>
      <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: colors.text, marginBottom: 12 }}>{t('forecast.title')}</Text>
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

const WeatherCard = ({ data }) => {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 500 });
  }, [data]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  if (!data || !data.main) return null;
  return (
    <View style={[{borderRadius:16, padding:24, alignItems:'center', margin:16, borderWidth:1, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:12}, { backgroundColor: isDarkMode ? 'rgba(22, 33, 62, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderColor: colors.border }]}>
      <Text style={[{fontSize:28, fontFamily:'Inter-Bold', marginBottom:8}, { color: colors.text }]}>{data.name}</Text>
      <Reanimated.View style={[{width:150, height:150, justifyContent:'center', alignItems:'center'}, animatedStyle]}>
        <Image source={{ uri: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png` }} style={{width:'100%', height:'100%'}} />
      </Reanimated.View>
      <Text style={[{fontSize:48, fontFamily:'Inter-Bold', marginVertical:8}, { color: colors.text }]}>{Math.round(data.main.temp)}°C</Text>
      <Text style={[{fontSize:18, fontFamily:'Inter-Medium', marginBottom:24, textTransform:'capitalize'}, { color: colors.textSecondary }]}>
        {data.weather[0].description}
      </Text>
      <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', borderTopWidth:1, borderTopColor:'rgba(0,0,0,0.1)', paddingTop:16}}>
        <View style={{alignItems:'center', flex:1}}>
          <Text style={[{fontSize:12, fontFamily:'Inter-Regular', marginBottom:4}, { color: colors.textSecondary }]}>{t('home.feelsLike')}</Text>
          <Text style={[{fontSize:16, fontFamily:'Inter-SemiBold'}, { color: colors.text }]}>{Math.round(data.main.feels_like)}°C</Text>
        </View>
        <View style={{alignItems:'center', flex:1}}>
          <Text style={[{fontSize:12, fontFamily:'Inter-Regular', marginBottom:4}, { color: colors.textSecondary }]}>{t('home.humidity')}</Text>
          <Text style={[{fontSize:16, fontFamily:'Inter-SemiBold'}, { color: colors.text }]}>{data.main.humidity}%</Text>
        </View>
        <View style={{alignItems:'center', flex:1}}>
          <Text style={[{fontSize:12, fontFamily:'Inter-Regular', marginBottom:4}, { color: colors.textSecondary }]}>{t('home.wind')}</Text>
          <Text style={[{fontSize:16, fontFamily:'Inter-SemiBold'}, { color: colors.text }]}>{data.wind.speed} m/s</Text>
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

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  const { colors } = useContext(ThemeContext);
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return (
    <Text style={[{fontSize:14, fontFamily:'Inter-Medium'}, { color: colors.text }]}>
      {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </Text>
  );
};

const ScreenWrapper = ({ children, condition }) => {
  const { colors } = useContext(ThemeContext);
  const getGradientColors = (cond) => {
    if (!cond) return [colors.background, colors.background];
    const main = cond.toLowerCase();
    if (main.includes('clear')) return ['#FFB75E', '#ED8F03'];
    if (main.includes('cloud')) return ['#bdc3c7', '#2c3e50'];
    if (main.includes('rain') || main.includes('drizzle')) return ['#2980b9', '#1a2a6c'];
    if (main.includes('snow')) return ['#E0EAFC', '#CFDEF3'];
    if (main.includes('thunder')) return ['#4b1248', '#F0C27B'];
    return [colors.background, colors.background];
  };
  return (
    <View style={{flex:1}}>
      {condition ? (
        <LinearGradient colors={getGradientColors(condition)} style={StyleSheet.absoluteFillObject}>{children}</LinearGradient>
      ) : (
        <View style={[{flex:1}, { backgroundColor: colors.background }]}>{children}</View>
      )}
    </View>
  );
};

// --- SCREENS ---
const SplashScreenView = ({ onFinish }) => {
  const { colors } = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => onFinish && onFinish());
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={[{...StyleSheet.absoluteFillObject, justifyContent:'center', alignItems:'center', zIndex:999}, { backgroundColor: colors.background }]}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Text style={[{fontSize:48, fontFamily:'Inter-Bold', marginBottom:8}, { color: colors.accent }]}>SkyPulse</Text>
        <Text style={[{fontSize:18, fontFamily:'Inter-Medium'}, { color: colors.text }]}>Your Sky, Your Way</Text>
      </Animated.View>
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { location, errorMsg, loading: locLoading, requestLocation } = useLocation();
  const { weatherData, loading: weatherLoading, error: weatherError, getWeatherByCoords } = useWeather();
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
  const loadWeather = () => location && getWeatherByCoords(location.coords.latitude, location.coords.longitude);
  useEffect(() => { if (location && !weatherData && !weatherError) loadWeather(); }, [location]);
  
  if (locLoading || (weatherLoading && !weatherData)) return <View style={[{flex:1, justifyContent:'center', alignItems:'center'}, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.accent} /></View>;
  if (errorMsg) return <ErrorState messageKey={errorMsg} onRetry={requestLocation} />;
  if (weatherError && !weatherData) return <ErrorState messageKey={weatherError} onRetry={loadWeather} />;
  if (!weatherData || !weatherData.current) return <View style={[{flex:1}, {backgroundColor: colors.background}]} />;
  
  return (
    <ScreenWrapper condition={weatherData.current.weather[0]?.main}>
      <ScrollView contentContainerStyle={{flexGrow:1, paddingBottom: 24}} refreshControl={<RefreshControl refreshing={weatherLoading} onRefresh={loadWeather} tintColor={colors.accent} />}>
        <WeatherCard data={weatherData.current} />
        <SmartAssistant current={weatherData.current} />
        <ForecastList forecast={weatherData.forecast} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const SearchScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const [query, setQuery] = useState('');
  const { weatherData, loading, error, getWeatherByCity } = useWeather();
  const [results, setResults] = useState([]);
  const handleSearch = async () => {
    if (!query.trim()) return;
    try { const data = await getWeatherByCity(query); if (data) setResults([data]); } catch (e) { setResults([]); }
  };
  
  return (
    <View style={[{flex:1, padding:16}, { backgroundColor: colors.background }]}>
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:16}}>
        <View style={[{flex:1, flexDirection:'row', alignItems:'center', borderWidth:1, borderRadius:8, paddingHorizontal:12, height:48, marginRight:12}, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={{marginRight:8}} />
          <TextInput style={[{flex:1, fontFamily:'Inter-Regular', fontSize:16}, { color: colors.text }]} placeholder={t('search.placeholder')} placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery} onSubmitEditing={handleSearch} />
        </View>
        <TouchableOpacity style={[{height:48, paddingHorizontal:16, justifyContent:'center', alignItems:'center', borderRadius:8}, { backgroundColor: colors.accent }]} onPress={handleSearch}>
          <Text style={{color:'#FFF', fontFamily:'Inter-SemiBold', fontSize:16}}>{t('search.button')}</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />}
      {!loading && error === 'cityNotFound' && <Text style={[{textAlign:'center', fontFamily:'Inter-Medium', marginTop:24, fontSize:16}, { color: colors.error }]}>{t('search.noResults')}</Text>}
      {!loading && !error && results.length > 0 && (
        <FlatList data={results} keyExtractor={(i) => i.current.id.toString()} renderItem={({ item }) => (
          <TouchableOpacity style={[{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, borderRadius:12, borderWidth:1, marginBottom:12}, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('WeatherDetail', { cityData: item })}>
            <View>
              <Text style={[{fontSize:18, fontFamily:'Inter-SemiBold', marginBottom:4}, { color: colors.text }]}>{item.current.name}</Text>
              <Text style={[{fontSize:14, fontFamily:'Inter-Regular', textTransform:'capitalize'}, { color: colors.textSecondary }]}>{item.current.weather[0].description}</Text>
            </View>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={[{fontSize:20, fontFamily:'Inter-Bold', marginRight:8}, { color: colors.text }]}>{Math.round(item.current.main.temp)}°C</Text>
              <Image source={{ uri: `https://openweathermap.org/img/wn/${item.current.weather[0].icon}.png` }} style={{width:40, height:40}} />
            </View>
          </TouchableOpacity>
        )} />
      )}
    </View>
  );
};

const WeatherDetailScreen = ({ route, navigation }) => {
  const { cityData } = route.params; // cityData is { current, forecast }
  const { colors } = useContext(ThemeContext);
  const { isFavorite, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const favorite = isFavorite(cityData.current.id);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: cityData.current.name,
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => favorite ? removeFavorite(cityData.current.id) : addFavorite(cityData.current)}>
          <Ionicons name={favorite ? "star" : "star-outline"} size={24} color={favorite ? colors.accent : colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, favorite, colors, cityData]);
  
  return (
    <ScreenWrapper condition={cityData?.current?.weather[0]?.main}>
      <ScrollView contentContainerStyle={{flexGrow:1, paddingBottom: 24}}>
        <WeatherCard data={cityData.current} />
        <SmartAssistant current={cityData.current} />
        <ForecastList forecast={cityData.forecast} />
      </ScrollView>
    </ScreenWrapper>
  );
};

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
    } catch(e) {} finally {
      setLoadingId(null);
    }
  };

  if (favorites.length === 0) return (
    <View style={[{flex:1, justifyContent:'center', alignItems:'center'}, { backgroundColor: colors.background }]}>
      <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
      <Text style={[{fontFamily:'Inter-Medium', fontSize:16, marginTop:16}, { color: colors.textSecondary }]}>{t('favorites.empty')}</Text>
    </View>
  );
  
  return (
    <View style={[{flex:1}, { backgroundColor: colors.background }]}>
      <FlatList data={favorites} keyExtractor={(i) => i.id.toString()} contentContainerStyle={{padding:16}} renderItem={({ item }) => (
        <TouchableOpacity 
          style={[{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, borderRadius:12, borderWidth:1, marginBottom:12}, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => handleFavoriteClick(item)}
          disabled={loadingId === item.id}
        >
          <View style={{flex:1}}>
            <Text style={[{fontSize:18, fontFamily:'Inter-SemiBold', marginBottom:8}, { color: colors.text }]}>{item.name}</Text>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              {loadingId === item.id ? (
                <ActivityIndicator size="small" color={colors.accent} style={{marginRight:8}} />
              ) : (
                <Image source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png` }} style={{width:30, height:30, marginRight:8}} />
              )}
              <Text style={[{fontSize:16, fontFamily:'Inter-Medium'}, { color: colors.textSecondary }]}>{Math.round(item.main.temp)}°C</Text>
            </View>
          </View>
          <TouchableOpacity style={{padding:8}} onPress={() => removeFavorite(item.id)}><Ionicons name="trash-outline" size={24} color={colors.error} /></TouchableOpacity>
        </TouchableOpacity>
      )} />
    </View>
  );
};

const SettingsScreen = () => {
  const { colors, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { locale, changeLanguage, t } = useContext(LanguageContext);
  return (
    <ScreenWrapper>
      <View style={[{flex:1, padding:16}, { backgroundColor: colors.background }]}>
        <View style={[{borderRadius:12, borderWidth:1, overflow:'hidden'}, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16}}>
            <Text style={[{fontSize:16, fontFamily:'Inter-Medium'}, { color: colors.text }]}>{t('settings.darkMode')}</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: '#767577', true: colors.accent }} thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'} />
          </View>
          <View style={[{height:1, width:'100%'}, { backgroundColor: colors.border }]} />
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16}}>
            <Text style={[{fontSize:16, fontFamily:'Inter-Medium'}, { color: colors.text }]}>{t('settings.language')}</Text>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity style={[{paddingHorizontal:12, paddingVertical:6, borderRadius:6, marginLeft:8, borderWidth:1, borderColor:'rgba(0,0,0,0.1)'}, locale === 'en' && { backgroundColor: colors.accent }]} onPress={() => changeLanguage('en')}>
                <Text style={[{fontFamily:'Inter-SemiBold', fontSize:14}, locale === 'en' ? { color: '#FFF' } : { color: colors.text }]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[{paddingHorizontal:12, paddingVertical:6, borderRadius:6, marginLeft:8, borderWidth:1, borderColor:'rgba(0,0,0,0.1)'}, locale === 'tr' && { backgroundColor: colors.accent }]} onPress={() => changeLanguage('tr')}>
                <Text style={[{fontFamily:'Inter-SemiBold', fontSize:14}, locale === 'tr' ? { color: '#FFF' } : { color: colors.text }]}>TR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

// --- NAVIGATION ---
const Tab = createBottomTabNavigator();
const SearchStack = createStackNavigator();
const HomeStack = createStackNavigator();

const SearchStackNavigator = () => {
  const { colors } = useContext(ThemeContext);
  return (
    <SearchStack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text, headerTitleStyle: { fontFamily: 'Inter-SemiBold' } }}>
      <SearchStack.Screen name="SearchList" component={SearchScreen} options={{ title: 'Search' }} />
      <SearchStack.Screen name="WeatherDetail" component={WeatherDetailScreen} options={{ title: 'City Weather' }} />
    </SearchStack.Navigator>
  );
};

const HomeStackNavigator = () => {
  const { colors } = useContext(ThemeContext);
  return (
    <HomeStack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text, headerTitleStyle: { fontFamily: 'Inter-SemiBold' } }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </HomeStack.Navigator>
  );
};

const AppNavigator = () => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'SearchTab') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'FavoritesTab') iconName = focused ? 'star' : 'star-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border }, headerShown: false,
      })}>
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: t('tabs.home') }} />
        <Tab.Screen name="SearchTab" component={SearchStackNavigator} options={{ title: t('tabs.search') }} />
        <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ title: t('tabs.favorites'), headerShown: true, headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// --- APP ENTRY ---
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Inter-Regular': Inter_400Regular,
          'Inter-Medium': Inter_500Medium,
          'Inter-SemiBold': Inter_600SemiBold,
          'Inter-Bold': Inter_700Bold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreenAsync.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);
  
  if (!appIsReady) return null;
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <SafeAreaView style={{flex:1}}>
            {showSplash ? <SplashScreenView onFinish={() => setShowSplash(false)} /> : <AppNavigator />}
          </SafeAreaView>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

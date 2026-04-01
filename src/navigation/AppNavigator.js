import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WeatherDetailScreen } from '../screens/WeatherDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const SearchStack = createStackNavigator();
const HomeStack = createStackNavigator();

const SearchStackNavigator = () => {
  const { colors } = useContext(ThemeContext);
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'Inter-SemiBold' },
      }}
    >
      <SearchStack.Screen name="SearchList" component={SearchScreen} options={{ title: 'Search' }} />
      <SearchStack.Screen name="WeatherDetail" component={WeatherDetailScreen} options={{ title: 'City Weather' }} />
    </SearchStack.Navigator>
  );
};

const HomeStackNavigator = () => {
  const { colors } = useContext(ThemeContext);
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'Inter-SemiBold' },
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </HomeStack.Navigator>
  );
};

export const AppNavigator = () => {
  const { colors } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'SearchTab') iconName = focused ? 'search' : 'search-outline';
            else if (route.name === 'FavoritesTab') iconName = focused ? 'star' : 'star-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStackNavigator} 
          options={{ title: t('tabs.home') }} 
        />
        <Tab.Screen 
          name="SearchTab" 
          component={SearchStackNavigator} 
          options={{ title: t('tabs.search') }} 
        />
        <Tab.Screen 
          name="FavoritesTab" 
          component={FavoritesScreen} 
          options={{ 
            title: t('tabs.favorites'),
            headerShown: true,
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
          }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

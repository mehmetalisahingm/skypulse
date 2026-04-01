import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // default dark via instructions if preferred, but let's use false by default

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const value = await AsyncStorage.getItem('@dark_mode');
        if (value !== null) {
          setIsDarkMode(JSON.parse(value));
        }
      } catch (e) {
        console.error('Failed to load theme.', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('@dark_mode', JSON.stringify(newTheme));
    } catch (e) {
      console.error('Failed to save theme.', e);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

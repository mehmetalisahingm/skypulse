import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('@favorites');
        if (stored !== null) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavorites();
  }, []);

  const addFavorite = async (cityDataCurrent) => {
    try {
      if (favorites.some((f) => f.id === cityDataCurrent.id)) return;
      const updated = [...favorites, cityDataCurrent];
      setFavorites(updated);
      await AsyncStorage.setItem('@favorites', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to add favorite', e);
    }
  };

  const removeFavorite = async (cityId) => {
    try {
      const updated = favorites.filter((f) => f.id !== cityId);
      setFavorites(updated);
      await AsyncStorage.setItem('@favorites', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
  };

  const isFavorite = (cityId) => {
    return favorites.some((f) => f.id === cityId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

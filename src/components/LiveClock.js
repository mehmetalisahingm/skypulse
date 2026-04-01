import React, { useState, useEffect, useContext } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Text style={[styles.text, { color: colors.text }]}>
      {formatDate(time)} • {formatTime(time)}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});

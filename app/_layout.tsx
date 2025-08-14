import { useFonts } from 'expo-font';
import { Slot } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <Slot />
      </DataProvider>
    </AuthProvider>
  );
}

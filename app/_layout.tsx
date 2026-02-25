import { AppProvider } from "@/lib/app-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";

// Import du CSS (Assure-toi d'avoir créé global.css à la racine)
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Chargement de TES polices précieuses
  const [fontsLoaded, fontError] = useFonts({
    'Algerian': require('../assets/fonts/Algerian.ttf'),
    'Monotype-Corsiva': require('../assets/fonts/MonotypeCorsiva.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (fontError) console.error("Erreur chargement polices:", fontError);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* On définit les routes principales */}
            <Stack.Screen name="index" />
            <Stack.Screen name="(screens)" />
          </Stack>
          <StatusBar style="auto" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

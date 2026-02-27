import { Stack } from 'expo-router';
import { AppProvider } from '@/lib/app-context'; // Ton provider SQLite
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false, // On cache le header par défaut car tu as créé tes propres headers personnalisés
            animation: 'slide_from_right', // Transition fluide style Android/iOS
            contentStyle: { backgroundColor: '#F8F9FB' },
          }}
        >
          {/* Écran d'accueil principal */}
          <Stack.Screen name="index" />

          {/* Écrans de navigation vers les salles et matériel */}
          <Stack.Screen name="screens/room-details" />
          <Stack.Screen name="screens/categories" />
          <Stack.Screen name="screens/add-materiel" />
          <Stack.Screen name="screens/room-contents" />

          {/* Écran de Chat Aube (Transition verticale pour l'effet messagerie) */}
          <Stack.Screen 
            name="screens/chat-aube" 
            options={{ animation: 'slide_from_bottom' }} 
          />

          {/* Écran des Paramètres (Accès Admin) */}
          <Stack.Screen name="screens/settings" />

          {/* Écrans de Guides (Développeur & Utilisation) */}
          <Stack.Screen name="screens/guide-viewer" />
          
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

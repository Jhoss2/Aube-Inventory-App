import { Stack } from 'expo-router';
import { AppProvider } from '@/lib/app-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Stack 
          screenOptions={{ 
            headerShown: false, 
            animation: 'slide_from_right',
            // Empêche un fond blanc clignotant lors des transitions sous Windows/Web
            contentStyle: { backgroundColor: '#fceef5' } 
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="screens/chat-aube" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="screens/guide-viewer" />
          <Stack.Screen name="screens/settings" />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

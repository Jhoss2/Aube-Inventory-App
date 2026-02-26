import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#b91c1c',
      tabBarStyle: { height: 65, borderTopLeftRadius: 30, borderTopRightRadius: 30 }
    }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color}/> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alertes', tabBarIcon: ({color}) => <Ionicons name="notifications" size={24} color={color}/> }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes', tabBarIcon: ({color}) => <Ionicons name="document-text" size={24} color={color}/> }} />
    </Tabs>
  );
}

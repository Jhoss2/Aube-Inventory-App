import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Force le chargement du dossier /app (Expo Router)
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);

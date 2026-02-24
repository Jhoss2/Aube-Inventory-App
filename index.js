import { registerRootComponent } from 'expo';
import App from './App';

// Cela garantit que l'application est correctement enregistrée, 
// peu importe si vous êtes sur Expo Go ou en APK natif.
registerRootComponent(App);

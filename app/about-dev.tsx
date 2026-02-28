import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  StatusBar, 
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

const { width, height } = Dimensions.get('window');

export default function AboutDevScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;
  
  // On récupère l'image définie dans les paramètres (Settings)
  const aboutPosterUri = appData.settings?.aboutPoster;

  return (
    <View style={styles.container}>
      {/* Barre d'état transparente pour une immersion totale */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {aboutPosterUri ? (
        <Image 
          source={{ uri: aboutPosterUri }} 
          style={styles.fullScreenImage}
          resizeMode="cover" // L'image occupe tout l'espace (quitte à être un peu rognée)
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="image-outline" size={100} color="rgba(255,255,255,0.2)" />
          <View style={{ marginTop: 20 }}>
            <Ionicons name="alert-circle" size={24} color="white" />
          </View>
        </View>
      )}

      {/* Bouton Retour Flottant (Indispensable pour la navigation) */}
      <TouchableOpacity 
        style={styles.floatingBack} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' // Fond noir pour éviter les flashs blancs
  },
  fullScreenImage: { 
    width: width, 
    height: height,
    position: 'absolute',
    top: 0,
    left: 0
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#1D3583',
    justifyContent: 'center',
    alignItems: 'center'
  },
  floatingBack: { 
    position: 'absolute', 
    top: 50, // Ajusté pour l'encoche (notch)
    left: 20, 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: 'rgba(0,0,0,0.4)', // Effet translucide moderne
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  }
});

import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  StatusBar, 
  Dimensions,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

const { width, height } = Dimensions.get('window');

export default function GuideViewerScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;
  
  // On récupère l'URI de l'image (affiche) définie dans les paramètres
  const guidePosterUri = appData.settings?.guidePoster;

  return (
    <View style={styles.container}>
      {/* Immersion totale : on cache la barre d'état ou on la rend transparente */}
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {guidePosterUri ? (
        <Image 
          source={{ uri: guidePosterUri }} 
          style={styles.fullScreenImage}
          resizeMode="contain" // "contain" est préférable pour un guide pour ne pas couper le texte sur les bords
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Feather name="book-open" size={80} color="rgba(255,255,255,0.2)" />
          <Text style={styles.placeholderText}>Le guide n'a pas encore été défini.</Text>
          <TouchableOpacity 
            style={styles.settingsLink} 
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsLinkText}>Aller aux Paramètres</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bouton Retour Flottant translucide */}
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
    backgroundColor: 'white' // Fond blanc pour le guide
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
    alignItems: 'center',
    padding: 40
  },
  placeholderText: {
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8
  },
  settingsLink: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  settingsLinkText: {
    color: 'white',
    fontWeight: 'bold'
  },
  floatingBack: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: 'rgba(29, 53, 131, 0.6)', // Bleu translucide pour le guide
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 10,
    elevation: 5
  }
});

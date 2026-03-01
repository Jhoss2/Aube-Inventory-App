import React from 'react';
import { 
  View, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Dimensions 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function FullscreenViewScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  return (
    <View style={styles.container}>
      {/* Cacher la barre d'état pour une immersion totale */}
      <StatusBar hidden />

      {/* BOUTON FERMER */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => router.back()}
      >
        <Feather name="x" size={30} color="white" />
      </TouchableOpacity>

      {/* AFFICHAGE DE L'IMAGE EN PLEIN ÉCRAN */}
      {imageUri ? (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.fullscreenImage} 
          resizeMode="contain" 
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fullscreenImage: { 
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height,
    // Note : Le resizeMode "contain" assure que toute l'image est visible 
    // sans être rognée, peu importe le ratio de la tablette.
  },
  closeButton: { 
    position: 'absolute', 
    top: 40, 
    right: 20, 
    zIndex: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 10, 
    borderRadius: 30 
  }
});

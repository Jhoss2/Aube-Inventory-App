import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, SectionList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { saveFileToDb } from '@/lib/database';

interface PasswordModalProps {
  visible: boolean;
  onPasswordSubmit: (password: string) => void;
  onCancel: () => void;
}

function PasswordModal({ visible, onPasswordSubmit, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <View className="bg-white rounded-2xl p-6 w-4/5 max-w-sm">
        <Text className="text-2xl font-bold text-center mb-2">Accès administrateur</Text>
        <Text className="text-gray-600 text-center mb-6">Veuillez entrer le mot de passe pour accéder aux paramètres.</Text>

        <View className="flex-row items-center bg-blue-100 border-2 border-blue-500 rounded-lg px-4 py-3 mb-6">
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="flex-1 text-base text-gray-800"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
          >
            <Text className="text-gray-800 font-semibold">Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onPasswordSubmit(password);
              setPassword('');
            }}
            className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
          >
            <Text className="text-white font-semibold">Valider</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateAppData, updateAubeKb } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    lateral: false,
    blocs: false,
    aube: false,
    documents: false,
  });
  const [aubeKbText, setAubeKbText] = useState(appData.aube.kb);

  const handlePasswordSubmit = (password: string) => {
    if (password === '1234') {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
    } else {
      Alert.alert('Erreur', 'Mot de passe incorrect');
    }
  };

  const handlePasswordCancel = () => {
    router.back();
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImagePicker = async (imageType: 'university' | 'background' | 'icon') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const fileId = `${imageType}-${new Date().getTime()}`;

        // Save to database
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            await saveFileToDb(fileId, base64);

            // Update app data
            if (imageType === 'university') {
              await updateAppData({
                general: { ...appData.general, mainBuildingImage: imageUri },
              });
            } else if (imageType === 'background') {
              await updateAppData({
                general: { ...appData.general, mainBgUrl: imageUri },
              });
            } else if (imageType === 'icon') {
              await updateAppData({
                general: { ...appData.general, appIconUrl: imageUri },
              });
            }
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error saving image:', error);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l\'image');
    }
  };

  const handleSaveAubeKb = async () => {
    await updateAubeKb(aubeKbText);
    Alert.alert('Succès', 'Base de connaissances Aube mise à jour');
  };

  if (!isAuthenticated) {
    return (
      <PasswordModal
        visible={showPasswordModal}
        onPasswordSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
      />
    );
  }

  return (
    <ScreenContainer className="bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <Text style={{ fontFamily: 'Algerian' }} className="text-2xl font-bold text-gray-800">
          PARAM TRÈS
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={28} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* General Section */}
        <View className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <TouchableOpacity
            onPress={() => toggleSection('general')}
            className="bg-gray-50 px-4 py-3 flex-row justify-between items-center"
          >
            <Text className="text-lg font-semibold text-gray-800">Général</Text>
            <Ionicons
              name={expandedSections.general ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>

          {expandedSections.general && (
            <View className="p-4 gap-4">
              {/* University Image */}
              <View>
                <Text className="text-gray-800 font-semibold mb-2">Changer l'image de l'université</Text>
                <TouchableOpacity
                  onPress={() => handleImagePicker('university')}
                  className="border border-gray-400 rounded-lg px-4 py-3 mb-2"
                >
                  <Text className="text-gray-800 font-semibold">Choisir un fichier</Text>
                </TouchableOpacity>
                <Text className="text-gray-500">Aucun fichier choisi</Text>
              </View>

              {/* Background Image */}
              <View>
                <Text className="text-gray-800 font-semibold mb-2">Changer l'arrière-plan de l'accueil</Text>
                <TouchableOpacity
                  onPress={() => handleImagePicker('background')}
                  className="border border-gray-400 rounded-lg px-4 py-3 mb-2"
                >
                  <Text className="text-gray-800 font-semibold">Choisir un fichier</Text>
                </TouchableOpacity>
                <Text className="text-gray-500">Aucun fichier choisi</Text>
              </View>

              {/* App Icon */}
              <View>
                <Text className="text-gray-800 font-semibold mb-2">Changer l'icône de l'application</Text>
                <TouchableOpacity
                  onPress={() => handleImagePicker('icon')}
                  className="border border-gray-400 rounded-lg px-4 py-3 mb-2"
                >
                  <Text className="text-gray-800 font-semibold">Choisir un fichier</Text>
                </TouchableOpacity>
                <Text className="text-gray-500">Aucun fichier choisi</Text>
              </View>
            </View>
          )}
        </View>

        {/* Lateral Menu Section */}
        <View className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <TouchableOpacity
            onPress={() => toggleSection('lateral')}
            className="bg-gray-50 px-4 py-3 flex-row justify-between items-center"
          >
            <Text className="text-lg font-semibold text-gray-800">Menu Latéral</Text>
            <Ionicons
              name={expandedSections.lateral ? 'chevron-up' : 'add'}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>

          {expandedSections.lateral && (
            <View className="p-4">
              <Text className="text-gray-600 text-center py-4">Personnalisation du menu en cours de développement</Text>
            </View>
          )}
        </View>

        {/* Bloc Personalization Section */}
        <View className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <TouchableOpacity
            onPress={() => toggleSection('blocs')}
            className="bg-gray-50 px-4 py-3 flex-row justify-between items-center"
          >
            <Text className="text-lg font-semibold text-gray-800">Personnalisation des Blocs</Text>
            <Ionicons
              name={expandedSections.blocs ? 'chevron-up' : 'add'}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>

          {expandedSections.blocs && (
            <View className="p-4">
              <Text className="text-gray-600 text-center py-4">Personnalisation des blocs en cours de développement</Text>
            </View>
          )}
        </View>

        {/* Aube KB Section */}
        <View className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <TouchableOpacity
            onPress={() => toggleSection('aube')}
            className="bg-gray-50 px-4 py-3 flex-row justify-between items-center"
          >
            <Text className="text-lg font-semibold text-gray-800">Base de Connaissances Aube</Text>
            <Ionicons
              name={expandedSections.aube ? 'chevron-up' : 'add'}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>

          {expandedSections.aube && (
            <View className="p-4 gap-3">
              <TextInput
                value={aubeKbText}
                onChangeText={setAubeKbText}
                multiline
                numberOfLines={6}
                placeholder="Entrez la base de connaissances d'Aube..."
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                textAlignVertical="top"
              />
              <TouchableOpacity
                onPress={handleSaveAubeKb}
                className="bg-blue-600 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold">Enregistrer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Documents Section */}
        <View className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <TouchableOpacity
            onPress={() => toggleSection('documents')}
            className="bg-gray-50 px-4 py-3 flex-row justify-between items-center"
          >
            <Text className="text-lg font-semibold text-gray-800">Documents</Text>
            <Ionicons
              name={expandedSections.documents ? 'chevron-up' : 'add'}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>

          {expandedSections.documents && (
            <View className="p-4">
              <Text className="text-gray-600 text-center py-4">Gestion des documents en cours de développement</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

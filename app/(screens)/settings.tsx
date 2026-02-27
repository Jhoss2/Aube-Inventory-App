import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Pour changer les images
import { useAppContext } from '@/lib/app-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateAppData } = useAppContext();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [openSections, setOpenSections] = useState<any>({ general: true });

  const toggleSection = (section: string) => {
    setOpenSections((prev: any) => ({ ...prev, [section]: !prev[section] }));
  };

  const pickImage = async (fieldPath: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Logique pour mettre à jour dynamiquement le champ dans appData
      const updatedData = { ...appData };
      // Note: Ici on simule une mise à jour profonde selon le champ
      updateAppData(updatedData); 
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authOverlay}>
        <View className="bg-white rounded-[30px] w-[85%] p-8 shadow-2xl">
          <Text className="text-xl font-black text-black text-center mb-2">Accès admin</Text>
          <Text className="text-gray-500 text-center mb-6 text-xs font-bold uppercase tracking-widest">
            Entrez le mot de passe
          </Text>
          <TextInput 
            secureTextEntry
            className="w-full border-b-2 border-gray-200 py-3 text-center text-2xl tracking-[10px] mb-8"
            value={password}
            onChangeText={setPassword}
            autoFocus
          />
          <View className="flex-row gap-x-4">
            <TouchableOpacity onPress={() => router.back()} className="flex-1 py-4 bg-gray-100 rounded-2xl items-center">
              <Text className="font-bold text-gray-400">ANNULER</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsAuthenticated(true)} className="flex-1 py-4 bg-[#2563EB] rounded-2xl items-center">
              <Text className="font-bold text-white">VALIDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header Rouge Signature */}
      <View className="px-4 pt-2 pb-2">
        <View className="bg-[#B21F18] rounded-full py-3 px-4 flex-row items-center shadow-lg">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-black text-white text-[12px] uppercase tracking-[3px] mr-6">
            PARAMÈTRES
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        
        {/* SECTION GÉNÉRAL */}
        <AccordionItem 
          title="Général" 
          isOpen={openSections.general} 
          onToggle={() => toggleSection('general')}
        >
          <SettingImageRow label="Image de l'université" onPress={() => pickImage('univ')} />
          <SettingImageRow label="Arrière-plan global" onPress={() => pickImage('bg')} />
        </AccordionItem>

        {/* SECTION MENU LATÉRAL */}
        <AccordionItem 
          title="Menu Latéral" 
          isOpen={openSections.menu} 
          onToggle={() => toggleSection('menu')}
        >
          <SettingImageRow label="Fond du menu" onPress={() => pickImage('menuBg')} />
          <SettingImageRow label="Logo du menu" onPress={() => pickImage('menuLogo')} />
          <SettingImageRow label="Image 'À propos'" onPress={() => pickImage('aboutImg')} />
        </AccordionItem>

        {/* SECTION AUBE (IA) */}
        <AccordionItem 
          title="Intelligence Aube" 
          isOpen={openSections.aube} 
          onToggle={() => toggleSection('aube')}
        >
          <Text className="text-[10px] font-black text-[#1D3583] uppercase mb-2">Comportement & Rôles</Text>
          <TextInput 
            multiline
            numberOfLines={4}
            className="bg-gray-50 rounded-2xl p-4 text-gray-700 font-bold border border-gray-100 mb-4"
            defaultValue={appData.settings?.aubePrompt}
            placeholder="Ex: Tu es un assistant technique expert..."
            textAlignVertical="top"
          />
          <SettingImageRow label="Avatar de Aube" onPress={() => pickImage('aubeAvatar')} />
        </AccordionItem>

        {/* SECTION DONNÉES */}
        <AccordionItem title="Données" isOpen={openSections.donnees} onToggle={() => toggleSection('donnees')}>
          <TouchableOpacity className="bg-green-600 py-4 rounded-2xl items-center flex-row justify-center gap-2">
            <Ionicons name="download-outline" size={20} color="white" />
            <Text className="text-white font-bold">Exporter en .CSV</Text>
          </TouchableOpacity>
        </AccordionItem>

      </ScrollView>
    </SafeAreaView>
  );
}

// Composants internes pour la clarté
const AccordionItem = ({ title, isOpen, onToggle, children }: any) => (
  <View className="border-b border-gray-50">
    <TouchableOpacity onPress={onToggle} className="flex-row justify-between items-center p-6">
      <Text className="text-lg font-black text-gray-800">{title}</Text>
      <Ionicons name={isOpen ? "remove" : "add"} size={22} color="#2563EB" />
    </TouchableOpacity>
    {isOpen && <View className="px-6 pb-8">{children}</View>}
  </View>
);

const SettingImageRow = ({ label, onPress }: any) => (
  <View className="flex-row items-center justify-between mb-6">
    <Text className="text-sm font-bold text-gray-600 flex-1 pr-4">{label}</Text>
    <TouchableOpacity onPress={onPress} className="bg-[#1D3583] px-4 py-2 rounded-xl">
      <Text className="text-white text-[10px] font-bold uppercase">Modifier</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  authOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }
});

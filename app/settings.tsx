import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateSettings } = useAppContext();

  const pickImage = async (field: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      updateSettings({ [field]: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} color="#c0262b" /></TouchableOpacity>
        <Text style={styles.headerTitle}>PARAMÈTRES</Text>
      </View>

      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>VISUELS</Text>
        <TouchableOpacity style={styles.row} onPress={() => pickImage('univImage')}>
          <Text>Image de l'université</Text>
          <Ionicons name="image-outline" size={20} color="#263d7e" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => pickImage('bgImage')}>
          <Text>Arrière-plan global</Text>
          <Ionicons name="apps-outline" size={20} color="#263d7e" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>INTELLIGENCE AUBE</Text>
        <TextInput 
          style={styles.input}
          placeholder="Prompt de l'IA..."
          multiline
          defaultValue={appData.settings?.aubePrompt}
          onChangeText={(text) => updateSettings({ aubePrompt: text })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, color: '#c0262b' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#999', marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, height: 100, textAlignVertical: 'top' }
});

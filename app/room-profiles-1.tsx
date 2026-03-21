import React, { useMemo, useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Image, 
  StyleSheet, SafeAreaView, Dimensions, Platform, Alert, TextInput, Modal
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, X, Check } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 55) / 4; 

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { blockId, type, level } = useLocalSearchParams();
  const { appData, deleteRoom, updateSalle } = useAppContext() as any;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);

  const rooms = useMemo(() => {
    return (appData.salles || []).filter((s: any) => 
      String(s.blockId) === String(blockId) && 
      String(s.level) === String(level)
    );
  }, [appData.salles, blockId, level]);

  const formatName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const handleLongPress = (room: any) => {
    Alert.alert(
      formatName(room.name),
      'Que souhaitez-vous faire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Modifier',
          onPress: () => {
            setEditingRoom(room);
            setEditName(room.name);
            setEditImage(room.image || null);
            setEditModalVisible(true);
          },
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmer',
              'Supprimer "' + formatName(room.name) + '" et tous ses matériels ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => deleteRoom(room.id) },
              ]
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handlePickImage = async () => {
    var result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setEditImage(result.assets[0].uri);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide.');
      return;
    }
    if (updateSalle) {
      updateSalle(editingRoom.id, { name: editName.trim(), image: editImage });
    }
    setEditModalVisible(false);
    setEditingRoom(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.redHeaderPill, styles.blackGlow]}>
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>
              {String(level).toUpperCase()}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          <Text style={styles.sectionTitle}>Profil Des Salles</Text>

          <View style={styles.grid}>
            {rooms.map((room: any) => (
              <TouchableOpacity 
                key={room.id} 
                style={styles.roomItem}
                onPress={() => router.push({ pathname: '/room-details', params: { roomId: room.id } })}
                onLongPress={() => handleLongPress(room)}
                delayLongPress={500}
              >
                <View style={[styles.avatarContainer, styles.blackGlow]}>
                  {room.image
                    ? <Image source={{ uri: room.image }} style={styles.imageAvatar} />
                    : <View style={styles.initialAvatar}>
                        <Text style={styles.initialText}>{room.name[0]}</Text>
                      </View>
                  }
                </View>
                <Text style={[styles.roomName, styles.boldSerifItalic]}>
                  {formatName(room.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.fab, styles.blackGlow]} 
          onPress={() => router.push({ pathname: '/add-room', params: { blockId, type, level } })}
        >
          <Plus size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── Modal modification ── */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, styles.boldSerifItalic]}>
                Modifier la salle
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#8B0000" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, styles.boldSerifItalic]}>Nom de la salle</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.textInput, styles.boldSerifItalic]}
              placeholder="Nom de la salle..."
              placeholderTextColor="#aaa"
            />

            <Text style={[styles.fieldLabel, styles.boldSerifItalic]}>Image</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
              {editImage
                ? <Image source={{ uri: editImage }} style={styles.imagePreview} />
                : <Text style={[styles.boldSerifItalic, { color: '#8B0000', fontSize: 14 }]}>
                    Choisir une image
                  </Text>
              }
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.boldSerifItalic, { color: '#8B0000', fontSize: 15 }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, styles.blackGlow]}
                onPress={handleSaveEdit}
              >
                <Check size={18} color="white" />
                <Text style={[styles.boldSerifItalic, { color: 'white', fontSize: 15, marginLeft: 6 }]}>
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  boldSerifItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },
  safeArea:      { flex: 1, backgroundColor: '#FFE4E8' },
  container:     { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 },
  redHeaderPill: {
    backgroundColor: '#8B0000', paddingVertical: 14, paddingHorizontal: 15,
    borderRadius: 50, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 35,
  },
  blackGlow: { elevation: 12, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } },
  headerTitleText: { color: 'white', fontSize: 16 },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900', fontStyle: 'italic',
    fontSize: 22, color: '#1a1a1a', marginBottom: 20, marginLeft: 4,
  },
  grid:          { flexDirection: 'row', flexWrap: 'wrap' },
  roomItem:      { width: COLUMN_WIDTH, alignItems: 'center', marginBottom: 20, marginHorizontal: 5 },
  avatarContainer: { width: '100%', aspectRatio: 1, borderRadius: 35, overflow: 'hidden', backgroundColor: 'white' },
  initialAvatar: { flex: 1, backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  initialText:   { color: 'white', fontSize: 24, fontWeight: 'bold' },
  imageAvatar:   { width: '100%', height: '100%' },
  roomName:      { marginTop: 6, color: '#000', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  fab:           { position: 'absolute', bottom: 30, right: 25, width: 60, height: 60, backgroundColor: '#8B0000', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },

  // Modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox:      { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 480, elevation: 20 },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:    { fontSize: 18, color: '#8B0000' },
  fieldLabel:    { fontSize: 13, color: '#555', marginBottom: 6, marginTop: 12 },
  textInput:     { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#333', backgroundColor: '#fafafa' },
  imagePickerBtn:{ borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', overflow: 'hidden' },
  imagePreview:  { width: '100%', height: '100%' },
  modalActions:  { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  cancelBtn:     { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#8B0000' },
  saveBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B0000', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
});

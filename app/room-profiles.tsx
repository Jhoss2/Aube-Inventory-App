import React, { useMemo, useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Image, 
  StyleSheet, SafeAreaView, Dimensions, Platform, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 55) / 4; 

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { blockId, type, level } = useLocalSearchParams();
  const { appData, deleteRoom } = useAppContext();

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
      'Supprimer la salle',
      `Voulez-vous vraiment supprimer "${formatName(room.name)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteRoom(room.id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.redHeaderPill, styles.blackGlow]}>
            <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={28} color="white" /></TouchableOpacity>
            <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>{String(level).toUpperCase()}</Text>
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
                  {room.image ? <Image source={{ uri: room.image }} style={styles.imageAvatar} /> : (
                    <View style={styles.initialAvatar}><Text style={styles.initialText}>{room.name[0]}</Text></View>
                  )}
                </View>
                <Text style={[styles.roomName, styles.boldSerifItalic]}>{formatName(room.name)}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  boldSerifItalic: { fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontWeight: '900', fontStyle: 'italic' },
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 },
  redHeaderPill: { backgroundColor: '#8B0000', paddingVertical: 14, paddingHorizontal: 15, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 35 },
  blackGlow: { elevation: 12, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } },
  headerTitleText: { color: 'white', fontSize: 16 },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 22,
    color: '#1a1a1a',
    marginBottom: 20,
    marginLeft: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  roomItem: { width: COLUMN_WIDTH, alignItems: 'center', marginBottom: 20, marginHorizontal: 5 },
  avatarContainer: { width: '100%', aspectRatio: 1, borderRadius: 35, overflow: 'hidden', backgroundColor: 'white' },
  initialAvatar: { flex: 1, backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  initialText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  imageAvatar: { width: '100%', height: '100%' },
  roomName: { marginTop: 6, color: '#000', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 60, height: 60, backgroundColor: '#8B0000', borderRadius: 30, justifyContent: 'center', alignItems: 'center' }
});
                    

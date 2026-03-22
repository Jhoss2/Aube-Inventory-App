import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, SafeAreaView, StatusBar, Platform,
  Dimensions, Alert, TextInput, Modal, ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

const { width } = Dimensions.get('window');
// 4 icones par ligne, meme espacement qu'avant
const MARGIN_H    = 4;
const PADDING_H   = 16;
const COLUMN_WIDTH = (width - PADDING_H * 2 - MARGIN_H * 8) / 4;

const BSI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

// Conserve la casse originale (respecte les majuscules saisies)
function formatName(name: string) {
  if (!name) return '';
  return name.trim();
}

// Niveaux connus dans l'ordre d'affichage
const NIVEAUX_ORDRE = [
  'Niveau 0', 'Niveau 1', 'Niveau 2', 'Niveau 3',
  'Niveau 4', 'Niveau 5', 'Rez-de-chaussée',
];

function sortNiveaux(niveaux: string[]) {
  return niveaux.sort(function(a, b) {
    var ia = NIVEAUX_ORDRE.indexOf(a);
    var ib = NIVEAUX_ORDRE.indexOf(b);
    if (ia === -1) ia = 99;
    if (ib === -1) ib = 99;
    if (ia !== ib) return ia - ib;
    return a.localeCompare(b);
  });
}

// Label lisible du niveau
function labelNiveau(level: string) {
  var map: Record<string, string> = {
    'Niveau 0':         'Rez-de-chaussée',
    'Niveau 1':         'Premier Niveau',
    'Niveau 2':         'Deuxième Niveau',
    'Niveau 3':         'Troisième Niveau',
    'Niveau 4':         'Quatrième Niveau',
    'Niveau 5':         'Cinquième Niveau',
    'Rez-de-chaussée':  'Rez-de-chaussée',
  };
  return map[level] || level;
}

export default function BlocDetailsScreen() {
  const router  = useRouter();
  const { blockId } = useLocalSearchParams<{ blockId: string }>();
  const { appData, deleteRoom, updateSalle, addSalle } = useAppContext() as any;

  // ── Modal modification salle ──
  const [editVisible,  setEditVisible]  = useState(false);
  const [editingRoom,  setEditingRoom]  = useState<any>(null);
  const [editName,     setEditName]     = useState('');
  const [editImage,    setEditImage]    = useState<string | null>(null);

  // ── Données ──
  const settings   = (appData && appData.settings) || {};
  const blocData   = (appData && appData.blocs && appData.blocs[blockId as string]) || {};
  const aerialImg  = settings['bloc' + blockId + '_aerial'] || blocData.mainImage ||
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80';
  const bgImage    = settings['bloc' + blockId + '_bg'] || null;

  // Toutes les salles de ce bloc, groupées par niveau
  const sallesParNiveau = useMemo(() => {
    var toutes = (appData && appData.salles || []).filter(
      (s: any) => String(s.blockId) === String(blockId)
    );
    var map: Record<string, any[]> = {};
    for (var i = 0; i < toutes.length; i++) {
      var lvl = toutes[i].level || 'Niveau 1';
      if (!map[lvl]) map[lvl] = [];
      map[lvl].push(toutes[i]);
    }
    return map;
  }, [appData.salles, blockId]);

  const niveaux = sortNiveaux(Object.keys(sallesParNiveau));

  // ── Handlers ──
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
            setEditVisible(true);
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
      ]
    );
  };

  const handlePickEditImage = async () => {
    var result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setEditImage(result.assets[0].uri);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) { Alert.alert('Erreur', 'Le nom ne peut pas être vide.'); return; }
    if (updateSalle) updateSalle(editingRoom.id, { name: editName.trim(), image: editImage });
    setEditVisible(false);
    setEditingRoom(null);
  };

  // FAB → ajouter une salle (niveau par défaut : Niveau 1)
  const handleAddRoom = () => {
    router.push({
      pathname: '/add-room',
      params: { blockId, type: 'salles', level: 'Niveau 1' },
    });
  };

  // ── Render ──
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Fond personnalisable */}
      {bgImage
        ? <ImageBackground source={{ uri: bgImage }} style={StyleSheet.absoluteFill} resizeMode="cover">
            <View style={styles.bgOverlay} />
          </ImageBackground>
        : <View style={[StyleSheet.absoluteFill, { backgroundColor: '#f5e6ea' }]} />
      }

      <View style={styles.root}>

        {/* ── HEADER FIXE ── */}
        <View style={[styles.headerPill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, BSI]}>
            {'EXPLORATION : BLOC ' + String(blockId).toUpperCase()}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* ── VUE AÉRIENNE FIXE ── */}
        <View style={styles.aerialSection}>
          <TouchableOpacity
            style={[styles.aerialCard, styles.glow]}
            activeOpacity={0.9}
            onPress={() => router.push({
              pathname: '/fullscreen-view',
              params: { imageUri: aerialImg, title: 'VUE AÉRIENNE - BLOC ' + blockId },
            })}
          >
            <Image source={{ uri: aerialImg }} style={styles.aerialImg} resizeMode="cover" />
          </TouchableOpacity>
          <View style={[styles.aerialPill, styles.glow]}>
            <Text style={[styles.aerialPillText, BSI]}>
              {'VUE AÉRIENNE DU BLOC'}
            </Text>
          </View>
        </View>

        {/* ── SALLES SCROLLABLES ── */}
        <ScrollView
          style={styles.scrollZone}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {niveaux.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, BSI]}>
                Aucune salle enregistrée pour ce bloc.
              </Text>
              <Text style={[styles.emptyHint, BSI]}>
                Appuyez sur + pour ajouter une salle.
              </Text>
            </View>
          )}

          {niveaux.map(function(niveau) {
            var salles = sallesParNiveau[niveau];
            return (
              <View key={niveau} style={styles.niveauSection}>

                {/* Pill titre niveau */}
                <View style={styles.niveauPillWrap}>
                  <View style={[styles.niveauPill, styles.glow]}>
                    <Text style={[styles.niveauPillText, BSI]}>
                      {labelNiveau(niveau).toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Grille salles */}
                <View style={styles.grid}>
                  {salles.map(function(room: any) {
                    return (
                      <TouchableOpacity
                        key={room.id}
                        style={styles.roomItem}
                        onPress={() => router.push({
                          pathname: '/room-details',
                          params: { roomId: room.id, roomName: room.name },
                        })}
                        onLongPress={() => handleLongPress(room)}
                        delayLongPress={500}
                      >
                        <View style={[styles.avatarWrap, styles.glow]}>
                          {room.image
                            ? <Image source={{ uri: room.image }} style={styles.avatarImg} />
                            : <View style={styles.avatarInitial}>
                                <Text style={[styles.avatarInitialText, BSI]}>
                                  {room.name ? room.name[0].toUpperCase() : '?'}
                                </Text>
                              </View>
                          }
                        </View>
                        <Text style={[styles.roomName, BSI]} numberOfLines={2}>
                          {formatName(room.name)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

              </View>
            );
          })}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── FAB FIXE ── */}
        <TouchableOpacity style={[styles.fab, styles.glow]} onPress={handleAddRoom}>
          <Plus size={32} color="white" />
        </TouchableOpacity>

      </View>

      {/* ── Modal modification ── */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, BSI]}>Modifier la salle</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <X size={24} color="#8B0000" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, BSI]}>Nom de la salle</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.textInput, BSI]}
              placeholder="Nom..."
              placeholderTextColor="#aaa"
            />

            <Text style={[styles.fieldLabel, BSI]}>Image</Text>
            <TouchableOpacity style={styles.imgPickerBtn} onPress={handlePickEditImage}>
              {editImage
                ? <Image source={{ uri: editImage }} style={styles.imgPreview} />
                : <Text style={[BSI, { color: '#8B0000', fontSize: 14 }]}>Choisir une image</Text>
              }
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={[BSI, { color: '#8B0000', fontSize: 15 }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, styles.glow]} onPress={handleSaveEdit}>
                <Check size={18} color="white" />
                <Text style={[BSI, { color: 'white', fontSize: 15, marginLeft: 6 }]}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: 'transparent' },
  bgOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,228,232,0.15)' },
  root:        { flex: 1 },

  // Header
  headerPill: {
    backgroundColor: '#8B0000', marginHorizontal: 16, marginTop: 20, marginBottom: 18,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn:     { width: 36 },
  headerTitle: { color: 'white', fontSize: 18, letterSpacing: 2 },

  // Vue aérienne (fixe)
  aerialSection: { marginHorizontal: 16, marginBottom: 0, alignItems: 'center' },
  aerialCard: {
    width: '100%', height: 180, borderRadius: 36,
    overflow: 'hidden', borderWidth: 2, borderColor: 'white',
  },
  aerialImg:    { width: '100%', height: '100%' },
  aerialPill: {
    backgroundColor: '#263d7e', paddingHorizontal: 28, paddingVertical: 10,
    borderRadius: 50, marginTop: -18, borderWidth: 1.5, borderColor: '#FFE4E8',
    zIndex: 10,
  },
  aerialPillText: { color: 'white', fontSize: 14, letterSpacing: 2 },

  // Zone scrollable
  scrollZone:    { flex: 1, marginTop: 18 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  // Section par niveau
  niveauSection:  { marginBottom: 28 },
  niveauPillWrap: { alignItems: 'center', marginBottom: 18 },
  niveauPill: {
    backgroundColor: '#263d7e', paddingHorizontal: 30, paddingVertical: 10,
    borderRadius: 50, borderWidth: 1.5, borderColor: '#FFE4E8',
  },
  niveauPillText: { color: 'white', fontSize: 14, letterSpacing: 2 },

  // Grille salles
  grid:      { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -MARGIN_H },
  roomItem:  { width: COLUMN_WIDTH, alignItems: 'center', marginBottom: 18, marginHorizontal: MARGIN_H },
  avatarWrap: {
    width: COLUMN_WIDTH - MARGIN_H * 2, aspectRatio: 1,
    borderRadius: 22, overflow: 'hidden', backgroundColor: 'white',
  },
  avatarImg:         { width: '100%', height: '100%' },
  avatarInitial:     { flex: 1, backgroundColor: '#8B0000', justifyContent: 'center', alignItems: 'center' },
  avatarInitialText: { color: 'white', fontSize: 22 },
  roomName: {
    marginTop: 6, color: '#1a1a1a', fontSize: 13,
    textAlign: 'center', lineHeight: 18,
  },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  emptyText: { color: '#8B0000', fontSize: 16, textAlign: 'center' },
  emptyHint: { color: '#888', fontSize: 13, marginTop: 8, textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute', bottom: 30, right: 25,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#8B0000', justifyContent: 'center', alignItems: 'center',
  },

  // Glow
  glow: {
    elevation: 10, shadowColor: '#000',
    shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 5 },
  },

  // Modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox:      { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 480, elevation: 20 },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:    { fontSize: 18, color: '#8B0000' },
  fieldLabel:    { fontSize: 13, color: '#555', marginBottom: 6, marginTop: 12 },
  textInput:     { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#333', backgroundColor: '#fafafa' },
  imgPickerBtn:  { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', overflow: 'hidden' },
  imgPreview:    { width: '100%', height: '100%' },
  modalActions:  { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  cancelBtn:     { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#8B0000' },
  saveBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B0000', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
});

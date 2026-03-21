import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, StatusBar, Alert, Image, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '@/lib/app-context';

const BSI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

export default function AddMaterialScreen() {
  const router = useRouter();
  const { roomId, roomName, category, blockId, type, level } = useLocalSearchParams<{
    roomId: string; roomName: string; category: string;
    blockId: string; type: string; level: string;
  }>();
  const { addMateriel } = useAppContext() as any;

  const [nom,       setNom]       = useState('');
  const [quantite,  setQuantite]  = useState('1');
  const [etat,      setEtat]      = useState('BON');
  const [marque,    setMarque]    = useState('');
  const [couleur,   setCouleur]   = useState('');
  const [infos,     setInfos]     = useState('');
  const [image,     setImage]     = useState<string | null>(null);

  const [dateAcquisition,    setDateAcquisition]    = useState<Date | null>(null);
  const [dateVerification,   setDateVerification]   = useState<Date | null>(null);
  const [dateRenouvellement, setDateRenouvellement] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'acquisition' | 'verification' | 'renouvellement' | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission', 'Accès à la galerie requis.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const handleDateChange = (_: any, selected: Date | undefined) => {
    if (!selected) { setShowPicker(null); return; }
    if (showPicker === 'acquisition')    setDateAcquisition(selected);
    if (showPicker === 'verification')   setDateVerification(selected);
    if (showPicker === 'renouvellement') setDateRenouvellement(selected);
    setShowPicker(null);
  };

  const handleSave = async () => {
    const finalName = nom.trim() || category || 'Matériel';
    const newItem = {
      id: 'item-' + Date.now(),
      roomId, nom: finalName, category,
      quantite, etat, marque, couleur, infos, image,
      dateAcquisition:    dateAcquisition    ? dateAcquisition.toISOString()    : null,
      dateVerification:   dateVerification   ? dateVerification.toISOString()   : null,
      dateRenouvellement: dateRenouvellement ? dateRenouvellement.toISOString() : null,
    };
    try {
      await addMateriel(newItem);
      // Redirection automatique vers le profil de la salle
      router.replace({
        pathname: '/room-details',
        params: { roomId, roomName },
      });
    } catch (err) {
      Alert.alert('Erreur', 'Sauvegarde impossible');
    }
  };

  const DateField = ({
    label, value, pickerKey,
  }: { label: string; value: Date | null; pickerKey: 'acquisition' | 'verification' | 'renouvellement' }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, BSI]}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.glow, styles.dateRow]}
        onPress={() => setShowPicker(pickerKey)}
      >
        <Text style={[value ? styles.dateText : styles.datePlaceholder, BSI]}>
          {value ? formatDate(value) : 'Sélectionner une date…'}
        </Text>
        <Calendar size={20} color="#1A237E" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={[styles.headerPill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, BSI]}>NOUVEAU MATÉRIEL</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* NOM */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, BSI]}>Nom du matériel</Text>
          <TextInput
            style={[styles.input, styles.glow, BSI]}
            value={nom}
            onChangeText={setNom}
            placeholder={'Ex: ' + (category || 'Climatiseur') + '...'}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* QUANTITÉ + ÉTAT */}
        <View style={styles.row}>
          <View style={{ flex: 0.4 }}>
            <Text style={[styles.label, BSI]}>Quantité</Text>
            <TextInput
              style={[styles.input, styles.glow, BSI]}
              value={quantite}
              onChangeText={setQuantite}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 0.6 }}>
            <Text style={[styles.label, BSI]}>État actuel</Text>
            <View style={styles.stateSelector}>
              {['NEUF', 'BON', 'USÉ'].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setEtat(s)}
                  style={[styles.stateBtn, etat === s && styles.stateBtnActive, styles.glow]}
                >
                  <Text style={[styles.stateBtnText, BSI, etat === s && styles.whiteText]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* MARQUE + COULEUR */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, BSI]}>Marque</Text>
            <TextInput
              style={[styles.input, styles.glow, BSI]}
              value={marque} onChangeText={setMarque}
              placeholder="Ex: Sony" placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, BSI]}>Couleur</Text>
            <TextInput
              style={[styles.input, styles.glow, BSI]}
              value={couleur} onChangeText={setCouleur}
              placeholder="Ex: Noir" placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* IMAGE */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, BSI]}>Image du matériel</Text>
          <TouchableOpacity style={[styles.photoBox, styles.glow]} onPress={pickImage}>
            {image
              ? <Image source={{ uri: image }} style={styles.fullImg} />
              : <View style={{ alignItems: 'center' }}>
                  <Camera size={32} color="#1A237E" />
                  <Text style={[styles.photoText, BSI]}>Ajouter une image</Text>
                </View>
            }
          </TouchableOpacity>
        </View>

        {/* DATES */}
        <DateField label="Date d'acquisition"                value={dateAcquisition}    pickerKey="acquisition"    />
        <DateField label="Date de dernière vérification"     value={dateVerification}   pickerKey="verification"   />
        <DateField label="Date de renouvellement conseillée" value={dateRenouvellement} pickerKey="renouvellement" />

        {/* INFOS */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, BSI]}>Informations / Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea, styles.glow, BSI]}
            multiline value={infos} onChangeText={setInfos}
            placeholder="Détails techniques, emplacement précis..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* SAVE */}
        <TouchableOpacity style={[styles.saveBtn, styles.glow]} onPress={handleSave}>
          <Text style={[styles.saveBtnText, BSI]}>Enregistrer</Text>
        </TouchableOpacity>

      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={
            showPicker === 'acquisition'    ? (dateAcquisition    || new Date()) :
            showPicker === 'verification'   ? (dateVerification   || new Date()) :
                                              (dateRenouvellement || new Date())
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          locale="fr-FR"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { padding: 25, paddingTop: 55, paddingBottom: 40 },

  headerPill: {
    backgroundColor: '#8B0000', height: 55, borderRadius: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, marginBottom: 35,
  },
  headerTitle:     { color: 'white', fontSize: 20, letterSpacing: 2 },
  inputGroup:      { marginBottom: 20 },
  label:           { fontSize: 16, color: '#1A237E', letterSpacing: 1.5, marginLeft: 10, marginBottom: 8, textTransform: 'uppercase' },
  input:           { backgroundColor: 'white', borderRadius: 20, padding: 15, color: '#374151', borderWidth: 1, borderColor: '#FCE7F3', fontSize: 15 },
  dateRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText:        { color: '#374151', fontSize: 15 },
  datePlaceholder: { color: '#94A3B8', fontSize: 15 },
  row:             { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stateSelector:   { flexDirection: 'row', gap: 6, flex: 1 },
  stateBtn:        { flex: 1, backgroundColor: 'white', borderRadius: 15, justifyContent: 'center', alignItems: 'center', height: 50 },
  stateBtnActive:  { backgroundColor: '#1A237E' },
  stateBtnText:    { fontSize: 13, color: '#1A237E' },
  whiteText:       { color: 'white' },
  photoBox:        { backgroundColor: 'white', height: 130, borderRadius: 25, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#1A237E', borderStyle: 'dashed' },
  photoText:       { fontSize: 16, color: '#1A237E', marginTop: 8 },
  fullImg:         { width: '100%', height: '100%' },
  textArea:        { height: 90, textAlignVertical: 'top' },
  saveBtn:         { backgroundColor: '#1A237E', paddingVertical: 20, borderRadius: 50, marginTop: 10, alignItems: 'center' },
  saveBtnText:     { color: 'white', fontSize: 16, letterSpacing: 2 },
  glow:            { elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
});
            

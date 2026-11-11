import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  StatusBar, 
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return iso; }
};

const etatColor = (etat: string | undefined) => {
  const e = (etat || '').toUpperCase().trim();
  if (['NEUF'].includes(e))                             return '#16a34a'; // vert
  if (['BON', 'BON ÉTAT', 'BON ETAT'].includes(e))     return '#2563eb'; // bleu
  if (['USÉ', 'USE', 'CORRECT'].includes(e))           return '#D97706'; // orange
  if (['ENDOMMAGÉ', 'ENDOMMAGE', 'EN PANNE', 'DAMAGED'].includes(e)) return '#dc2626'; // rouge
  return '#374151'; // gris par défaut
};

function InfoLine({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <View style={styles.infoLine}>
      <Text style={[styles.labelBlue, styles.SBI]}>{label} :</Text>
      <Text style={[styles.valueTxt, styles.SBI]}>
        {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
      </Text>
    </View>
  );
}

export default function MaterialDetailsScreen() {
  const router = useRouter();
  const { materialId } = useLocalSearchParams<{ materialId: string }>();
  const { appData, deleteMateriel } = useAppContext() as any;

  const item = (appData.materiels || []).find((m: any) => String(m.id) === String(materialId));
  const roomContentsBg = (appData && appData.settings && appData.settings.roomContentsBg) || null;

  const handleDelete = () => {
    Alert.alert("Supprimer", "Voulez-vous vraiment supprimer cet objet ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => { deleteMateriel(item.id); router.back(); } }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {roomContentsBg && (
        <ImageBackground source={{ uri: roomContentsBg }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER — titre = nom du matériel */}
        <View style={[styles.redHeaderPill, styles.glowBlack]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleText, styles.SBI]} numberOfLines={1}>
            {(item && item.nom) || 'Matériel'}
          </Text>
          <View style={{ width: 40 }} /> 
        </View>

        {!item ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, styles.SBI]}>Matériel introuvable.</Text>
          </View>
        ) : (
          <View style={[styles.materialCard, styles.glowBlack]}>
            
            {/* IMAGE */}
            <View style={styles.imageBox}>
              {item.image
                ? <Image source={{ uri: item.image }} style={styles.materialImg} resizeMode="contain" />
                : <View style={[styles.materialImg, styles.imagePlaceholder]}>
                    <Text style={[styles.placeholderLetter, styles.SBI]}>
                      {item.nom ? item.nom[0].toUpperCase() : '?'}
                    </Text>
                  </View>
              }
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.infoCol}>

                {/* NOM */}
                <Text style={[styles.mainTitle, styles.SBI]}>{item.nom || '—'}</Text>

                {/* CHAMPS PRINCIPAUX */}
                <InfoLine label="Catégorie"  value={item.category} />
                <InfoLine label="Marque"     value={item.marque} />
                <InfoLine label="Couleur"    value={item.couleur} />
                <InfoLine label="Quantité"   value={item.quantite} />

                {/* ÉTAT avec couleur dynamique */}
                <View style={styles.infoLine}>
                  <Text style={[styles.labelBlue, styles.SBI]}>État :</Text>
                  <Text style={[styles.statusVal, styles.SBI, { color: etatColor(item.etat) }]}>
                    {item.etat || '—'}
                  </Text>
                </View>

                {/* SÉPARATEUR */}
                <View style={styles.divider} />

                {/* DATES */}
                <InfoLine label="Acquisition"    value={fmtDate(item.dateAcquisition)} />
                <InfoLine label="Vérification"   value={fmtDate(item.dateVerification)} />
                <InfoLine label="Renouvellement" value={fmtDate(item.dateRenouvellement)} />

                {/* NOTES */}
                {!!item.infos && (
                  <View style={styles.notesBox}>
                    <Text style={[styles.labelBlue, styles.SBI]}>Notes :</Text>
                    <Text style={[styles.notesText, styles.SBI]}>{item.infos}</Text>
                  </View>
                )}

              </View>

              {/* BOUTONS ACTION */}
              <View style={styles.actionCol}>
                <TouchableOpacity style={styles.editBtn}>
                  <Pencil size={20} color="#1A237E" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Trash2 size={20} color="#8B0000" />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },

  SBI: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },

  scrollContent: { padding: 25, paddingTop: 55, paddingBottom: 40 },

  redHeaderPill: {
    backgroundColor: '#8B0000',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  backBtn: { padding: 5 },
  headerTitleText: {
    color: 'white', fontSize: 20, flex: 1,
    textAlign: 'center', letterSpacing: 1,
  },

  materialCard: {
    backgroundColor: 'white',
    borderRadius: 35,
    marginBottom: 25,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
  },

  imageBox: { marginBottom: 15 },
  materialImg: { width: '100%', aspectRatio: 1, borderRadius: 25, backgroundColor: '#F1F5F9' },
  imagePlaceholder: { backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  placeholderLetter: { color: 'white', fontSize: 56 },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
  infoCol: { flex: 1 },

  mainTitle: { color: '#1A237E', fontSize: 17, marginBottom: 10, letterSpacing: 0.5 },

  infoLine: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
  labelBlue: { color: '#64748B', fontSize: 11, width: 110 },
  valueTxt: { color: '#374151', fontSize: 14, flex: 1 },
  statusVal: { fontSize: 16 },

  divider: { height: 1, backgroundColor: '#FCE7F3', marginVertical: 10, marginRight: 10 },

  notesBox: { marginTop: 4, marginRight: 10 },
  notesText: { color: '#374151', fontSize: 13, marginTop: 3, lineHeight: 18 },

  actionCol: { justifyContent: 'center', marginLeft: 15, gap: 12 },
  editBtn: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 20 },
  deleteBtn: { backgroundColor: '#FFE4E8', padding: 12, borderRadius: 20 },

  emptyBox: { marginTop: 80, alignItems: 'center' },
  emptyText: { color: '#94A3B8', letterSpacing: 1, fontSize: 16 },

  glowBlack: {
    elevation: 8, shadowColor: '#000',
    shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});

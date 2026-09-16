import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ImageBackground, Image, Platform, FlatList,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAppContext } from '@/lib/app-context';

const SBI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: any): string {
  return (v !== undefined && v !== null && v !== '') ? String(v) : '';
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return fmt(iso); }
}

// ── Conversion d'une image (locale ou distante) en data URI base64 ────────────
// Garantit un rendu réel de l'image dans le PDF, y compris hors-ligne : le
// fichier est intégré directement dans le HTML plutôt que simplement référencé.
async function toDataUri(uri: string | null | undefined): Promise<string> {
  if (!uri) return '';
  try {
    if (uri.indexOf('data:') === 0) return uri;

    var localUri = uri;
    if (uri.indexOf('http://') === 0 || uri.indexOf('https://') === 0) {
      var dest = FileSystem.cacheDirectory + 'pdfimg_' + Date.now() + '_' +
        Math.floor(Math.random() * 100000) + '.jpg';
      var dl = await FileSystem.downloadAsync(uri, dest);
      localUri = dl.uri;
    }

    var base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    var ext = (localUri.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
    var mime = ext === 'png' ? 'image/png'
      : ext === 'webp' ? 'image/webp'
      : ext === 'gif' ? 'image/gif'
      : 'image/jpeg';
    return 'data:' + mime + ';base64,' + base64;
  } catch (e) {
    return '';
  }
}

// ── Générateur HTML principal — A4 portrait, fidèle à la maquette fournie ─────
function buildHtml(room: any, items: any[], logoData: string): string {
  var roomName = room.name
    ? room.name.charAt(0).toUpperCase() + room.name.slice(1).toLowerCase()
    : fmt(room.id);

  var today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  var logoHtml = logoData
    ? '<img class="logo" src="' + logoData + '" />'
    : '';

  var cardsHtml = '';
  if (items.length === 0) {
    cardsHtml = (
      '<div class="empty">Aucun mat\u00e9riel enregistr\u00e9 pour cette salle.</div>'
    );
  } else {
    cardsHtml = '<div class="grid">' + items.map(function(item: any) {
      var imgHtml = item.image
        ? '<img src="' + item.image + '" />'
        : '<div class="noimg">' + (item.nom ? item.nom.charAt(0).toUpperCase() : '?') + '</div>';

      return (
        '<div class="card">' +
        imgHtml +
        '<div class="fields">' +
        '<p><b>Cat\u00e9gorie : </b><span>' + fmt(item.category) + '</span></p>' +
        '<p><b>Nom : </b><span>' + fmt(item.nom) + '</span></p>' +
        '<p><b>Marque : </b><span>' + fmt(item.marque) + '</span></p>' +
        '<p><b>Couleur : </b><span>' + fmt(item.couleur) + '</span></p>' +
        '<p><b>Quantit\u00e9 : </b><span>' + fmt(item.quantite) + '</span></p>' +
        '<p><b>\u00c9tat : </b><span>' + fmt(item.etat) + '</span></p>' +
        '<p><b>D.A : </b><span>' + fmtDate(item.dateAcquisition) + '</span></p>' +
        '<p><b>D.D.V : </b><span>' + fmtDate(item.dateVerification) + '</span></p>' +
        '<p><b>D.R.C : </b><span>' + fmtDate(item.dateRenouvellement) + '</span></p>' +
        '</div>' +
        '</div>'
      );
    }).join('') + '</div>';
  }

  return (
    '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>' +
    '<style>' +
    '@page{size:A4 portrait;margin:26px 34px;}' +
    '*{box-sizing:border-box;margin:0;padding:0;}' +
    'body{background:#ffffff;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;}' +

    '.header{display:flex;align-items:center;gap:18px;margin-bottom:30px;}' +
    '.logo{width:82px;height:82px;object-fit:contain;flex-shrink:0;}' +
    '.header-text h1{font-size:22px;color:#8B0000;font-weight:800;margin-bottom:5px;}' +
    '.header-text h2{font-size:14px;color:#374151;font-weight:700;}' +

    '.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px 16px;}' +
    '.card{display:flex;gap:9px;align-items:flex-start;}' +
    '.card img,.card .noimg{width:66px;height:66px;border-radius:14px;object-fit:cover;flex-shrink:0;}' +
    '.card .noimg{background:linear-gradient(160deg,#1A237E,#3b5bdb);color:white;' +
    'display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;}' +

    '.fields p{font-size:8.5px;line-height:1.55;color:#111827;font-weight:700;}' +
    '.fields span{color:#1A237E;font-weight:700;}' +

    '.empty{text-align:center;color:#6b7280;font-style:italic;margin-top:80px;font-size:13px;}' +
    '.footer{margin-top:40px;text-align:right;font-style:italic;color:#8B0000;font-size:12px;font-weight:600;}' +
    '</style></head><body>' +

    '<div class="header">' + logoHtml +
    '<div class="header-text"><h1>' + roomName + '</h1><h2>Contenu de la salle</h2></div>' +
    '</div>' +

    cardsHtml +

    '<div class="footer">' + today + '</div>' +

    '</body></html>'
  );
}

// ── Composant React Native ────────────────────────────────────────────────────

export default function SideBar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { appData } = useAppContext() as any;

  const settings         = (appData && appData.settings) || {};
  const menuBg           = settings.menuBg   || null;
  const menuLogo         = settings.menuLogo || null;
  const rooms: any[]     = (appData && appData.salles) || [];

  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [isGenerating,   setIsGenerating]   = useState(false);

  const menuOptions = [
    { label: "Guide d'utilisation",      path: '/guide-viewer' },
    { label: "À propos du développeur",  path: '/about-dev'    },
    { label: "Bibliothèque d'Aube",      path: '/aube-library' },
    { label: "Cerveau Local d'Aube",     path: '/aube-llm'     },
  ];

  const handleDownload = async (room: any) => {
    setShowRoomPicker(false);
    setIsGenerating(true);
    try {
      const rawItems = ((appData && appData.materiels) || []).filter(
        (m: any) => String(m.roomId) === String(room.id)
      );

      // Encodage en base64 : garantit que le logo et les images du matériel
      // s'affichent réellement dans le PDF, y compris sans connexion.
      const itemsWithData = await Promise.all(
        rawItems.map(async (m: any) => Object.assign({}, m, { image: await toDataUri(m.image) }))
      );
      const logoData = await toDataUri(settings.pdfLogo);

      const html = buildHtml(room, itemsWithData, logoData);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setIsGenerating(false);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Donn\u00e9es \u2014 ' + (room.name || room.id),
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF g\u00e9n\u00e9r\u00e9', 'Fichier enregistr\u00e9 :\n' + uri);
      }
    } catch (e: any) {
      setIsGenerating(false);
      Alert.alert('Erreur', 'Impossible de g\u00e9n\u00e9rer le PDF : ' + e.message);
    }
  };

  return (
    <>
      {/* ══ SIDEBAR ══ */}
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.container}>
          <ImageBackground
            source={menuBg
              ? { uri: menuBg }
              : { uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000' }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          >
            <View style={styles.blueOverlay} />
          </ImageBackground>

          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, SBI]}>
                {'U-AUBEN\nINVENTORY\nAPP'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={32} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.navScroll}
              contentContainerStyle={styles.navContent}
              showsVerticalScrollIndicator={false}
            >
              {menuOptions.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.navBtn}
                  onPress={() => { onClose(); router.push(opt.path as any); }}
                >
                  <Text style={[styles.navText, SBI]}>{'· ' + opt.label + ' ·'}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.dlBtn}
                onPress={() => setShowRoomPicker(true)}
              >
                <Feather name="download" size={20} color="white" />
                <Text style={[styles.dlText, SBI]}>{'· T\u00e9l\u00e9chargement\n  des donn\u00e9es ·'}</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Text style={[styles.versionText, SBI]}>{'· Version 1.0 ·'}</Text>
              <View style={styles.logoOuter}>
                <View style={styles.logoInner}>
                  {menuLogo
                    ? <Image source={{ uri: menuLogo }} style={styles.logoImg} />
                    : <View style={styles.logoPlaceholder}>
                        <Text style={[styles.logoPlaceholderText, SBI]}>Logo</Text>
                      </View>
                  }
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.closeZone} onPress={onClose} activeOpacity={1} />
        </View>
      </Modal>

      {/* ══ SÉLECTEUR DE SALLE ══ */}
      <Modal transparent visible={showRoomPicker} animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, SBI]}>Choisir une salle</Text>
              <TouchableOpacity onPress={() => setShowRoomPicker(false)}>
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {rooms.length === 0
              ? <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyText, SBI]}>Aucune salle enregistr\u00e9e.</Text>
                </View>
              : <FlatList
                  data={rooms}
                  keyExtractor={(item) => String(item.id)}
                  contentContainerStyle={{ padding: 16 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.roomRow} onPress={() => handleDownload(item)}>
                      <View style={styles.roomAvatar}>
                        {item.image
                          ? <Image source={{ uri: item.image }} style={styles.roomAvatarImg} />
                          : <Text style={[styles.roomAvatarLetter, SBI]}>
                              {(item.name || '?')[0].toUpperCase()}
                            </Text>
                        }
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.roomRowName, SBI]}>
                          {item.name
                            ? item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()
                            : 'Salle ' + item.id}
                        </Text>
                        <Text style={[styles.roomRowSub, SBI]}>
                          {'Bloc ' + (item.blockId || '\u2014') + ' \u00b7 Niveau ' + (item.level || '\u2014')}
                        </Text>
                      </View>
                      <Feather name="download" size={20} color="#8B0000" />
                    </TouchableOpacity>
                  )}
                />
            }
          </View>
        </View>
      </Modal>

      {/* ══ GÉNÉRATION ══ */}
      {isGenerating && (
        <Modal transparent visible animationType="fade">
          <View style={styles.genOverlay}>
            <View style={styles.genBox}>
              <ActivityIndicator size="large" color="#e85d04" />
              <Text style={[styles.genText, SBI]}>G\u00e9n\u00e9ration du PDF\u2026</Text>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, flexDirection: 'row' },
  blueOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,58,138,0.4)' },
  closeZone:   { flex: 1, height: '100%' },

  drawer: {
    width: '50%', height: '100%',
    backgroundColor: 'rgba(139,0,0,0.92)',
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15,
  },
  drawerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 20, paddingTop: 55,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  drawerTitle: { color: 'white', fontSize: 28, lineHeight: 32, textTransform: 'uppercase' },

  navScroll:  { flex: 1 },
  navContent: { paddingTop: 28, paddingBottom: 16, alignItems: 'center' },
  navBtn:     { marginBottom: 22, paddingHorizontal: 15, width: '100%' },
  navText:    { color: 'white', fontSize: 18, textAlign: 'center' },

  dlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
    marginTop: 8, width: '88%',
  },
  dlText: { color: 'white', fontSize: 15, flex: 1 },

  drawerFooter: { paddingBottom: 36, alignItems: 'center' },
  versionText:  { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 16 },
  logoOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)', padding: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoInner: {
    width: '100%', height: '100%', borderRadius: 40,
    backgroundColor: '#fbcfe8', justifyContent: 'center',
    alignItems: 'center', overflow: 'hidden',
  },
  logoImg:             { width: '100%', height: '100%' },
  logoPlaceholder:     { justifyContent: 'center', alignItems: 'center' },
  logoPlaceholderText: { fontSize: 16, color: '#8B0000' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#0a0f2e', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '75%', overflow: 'hidden',
    shadowColor: '#e85d04', shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  pickerHeader: {
    backgroundColor: '#e85d04',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  pickerTitle: { color: 'white', fontSize: 18 },
  emptyWrap:   { padding: 40, alignItems: 'center' },
  emptyText:   { color: '#ff9a3c', fontSize: 15 },

  roomRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,160,60,0.3)',
  },
  roomAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#e85d04',
    justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden',
  },
  roomAvatarImg:    { width: '100%', height: '100%' },
  roomAvatarLetter: { color: 'white', fontSize: 20 },
  roomRowName:      { fontSize: 15, color: 'white' },
  roomRowSub:       { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  genOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  genBox: {
    backgroundColor: '#0a0f2e', borderRadius: 24, padding: 36,
    alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: 'rgba(255,160,60,0.4)',
    shadowColor: '#e85d04', shadowOpacity: 0.4, shadowRadius: 24, elevation: 20,
  },
  genText: { color: '#ff9a3c', fontSize: 16 },
});
                            

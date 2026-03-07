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
import { useAppContext } from '@/lib/app-context';

const SBI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

// ── Helpers HTML (pas de template literals imbriqués) ────────────────────────

function fmt(v: any): string {
  return (v !== undefined && v !== null && v !== '') ? String(v) : '\u2014';
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '\u2014';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return fmt(iso);
  }
}

function pillHtml(label: string, value: string, bg: string, color: string): string {
  return (
    '<div style="background:' + bg + ';border-radius:50px;padding:5px 14px;' +
    'display:inline-flex;align-items:center;gap:6px;margin:3px;' +
    'box-shadow:0 2px 8px rgba(0,0,0,0.07),0 1px 0 rgba(255,255,255,0.9) inset;' +
    'border:1px solid rgba(255,255,255,0.7);">' +
    '<span style="font-size:10px;font-style:italic;font-weight:700;color:#64748b;">' + label + '</span>' +
    '<span style="font-size:12px;font-style:italic;font-weight:900;color:' + color + ';">' + value + '</span>' +
    '</div>'
  );
}

function etatBadgeHtml(e: string): string {
  var label = fmt(e);
  var bg = 'linear-gradient(135deg,#94A3B8,#64748B)';
  var eUp = (e || '').toUpperCase().trim();
  if (eUp === 'NEUF') { label = '\u2728 Neuf'; bg = 'linear-gradient(135deg,#16a34a,#4ade80)'; }
  else if (eUp === 'BON') { label = '\uD83D\uDC4D Bon \u00e9tat'; bg = 'linear-gradient(135deg,#2563eb,#60a5fa)'; }
  else if (eUp === 'US\u00c9' || eUp === 'USE') { label = '\u26a0\ufe0f Us\u00e9'; bg = 'linear-gradient(135deg,#D97706,#fbbf24)'; }
  else if (eUp.includes('PANNE') || eUp.includes('ENDOMM')) { label = '\uD83D\uDD34 Endomma\u0301'; bg = 'linear-gradient(135deg,#dc2626,#f87171)'; }
  return (
    '<span style="background:' + bg + ';color:white;padding:4px 14px;border-radius:50px;' +
    'font-size:11px;font-weight:900;font-style:italic;white-space:nowrap;' +
    'box-shadow:0 2px 8px rgba(0,0,0,0.18);">' + label + '</span>'
  );
}

function imgCellHtml(uri: string | undefined, initial: string): string {
  if (uri) {
    return (
      '<img src="' + uri + '" style="width:100%;height:130px;object-fit:cover;' +
      'border-radius:18px;box-shadow:0 4px 16px rgba(124,58,237,0.18);' +
      'display:block;margin-bottom:10px;"/>'
    );
  }
  return (
    '<div style="width:100%;height:130px;border-radius:18px;' +
    'background:linear-gradient(135deg,#e0e7ff,#f0fdf4);' +
    'display:flex;align-items:center;justify-content:center;' +
    'font-size:36px;font-style:italic;font-weight:900;color:#a78bfa;' +
    'margin-bottom:10px;box-shadow:0 4px 16px rgba(124,58,237,0.10);">' +
    initial + '</div>'
  );
}

function buildCardHtml(item: any, roomName: string, idx: number): string {
  var bg = (idx % 2 === 0)
    ? 'linear-gradient(160deg,rgba(255,255,255,0.92) 0%,rgba(224,231,255,0.60) 100%)'
    : 'linear-gradient(160deg,rgba(255,255,255,0.85) 0%,rgba(207,250,254,0.55) 100%)';

  var initial = (item.nom || '?')[0].toUpperCase();
  var imgHtml = imgCellHtml(item.image, initial);

  var pills = (
    pillHtml('Salle',          roomName,                      '#ede9fe', '#5b21b6') +
    pillHtml('Cat\u00e9gorie', fmt(item.category),            '#ede9fe', '#5b21b6') +
    pillHtml('Marque',         fmt(item.marque),              '#e0f2fe', '#0369a1') +
    pillHtml('Couleur',        fmt(item.couleur),             '#fce7f3', '#9d174d') +
    pillHtml('Quantit\u00e9',  fmt(item.quantite),            '#dcfce7', '#166534') +
    pillHtml('Acquisition',    fmtDate(item.dateAcquisition), '#fef9c3', '#854d0e') +
    pillHtml('V\u00e9rification', fmtDate(item.dateVerification), '#f0fdf4', '#14532d') +
    pillHtml('Renouvellement', fmtDate(item.dateRenouvellement), '#fff7ed', '#9a3412')
  );

  var notesHtml = item.infos
    ? ('<div style="background:rgba(255,255,255,0.6);border-radius:14px;padding:10px 14px;' +
       'font-size:12px;font-style:italic;font-weight:700;color:#475569;margin-top:10px;' +
       'border:1px solid rgba(148,163,184,0.25);">\uD83D\uDCDD ' + fmt(item.infos) + '</div>')
    : '';

  return (
    '<div style="background:' + bg + ';border-radius:24px;padding:18px 20px;margin-bottom:18px;' +
    'box-shadow:0 8px 32px rgba(124,58,237,0.10),0 1.5px 0 rgba(255,255,255,0.9) inset;' +
    'border:1.5px solid rgba(255,255,255,0.75);page-break-inside:avoid;">' +
    imgHtml +
    '<div style="font-size:17px;font-weight:900;font-style:italic;color:#3730a3;' +
    'margin-bottom:12px;">' + fmt(item.nom) + '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">' + pills + '</div>' +
    '<div>' + etatBadgeHtml(item.etat || '') + '</div>' +
    notesHtml +
    '</div>'
  );
}

function buildHtml(room: any, materiels: any[]): string {
  var items = materiels.filter(function(m: any) {
    return String(m.roomId) === String(room.id);
  });

  var roomName = room.name
    ? room.name.charAt(0).toUpperCase() + room.name.slice(1).toLowerCase()
    : fmt(room.id);

  var today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  var cardsHtml = items.length > 0
    ? items.map(function(item: any, idx: number) { return buildCardHtml(item, roomName, idx); }).join('')
    : '<div style="text-align:center;padding:48px;border-radius:24px;background:rgba(255,255,255,0.7);' +
      'font-style:italic;font-size:15px;color:#94a3b8;">Aucun mat\u00e9riel enregistr\u00e9.</div>';

  var metaPills = (
    '<div style="background:linear-gradient(135deg,rgba(255,255,255,0.9),rgba(224,231,255,0.7));' +
    'border-radius:50px;padding:8px 20px;font-size:13px;font-weight:900;font-style:italic;color:#3730a3;' +
    'box-shadow:0 4px 16px rgba(124,58,237,0.12);border:1px solid rgba(255,255,255,0.8);margin-right:10px;">' +
    'Niveau\u00a0: <span style="color:#7C3AED;">' + fmt(room.level) + '</span></div>' +

    '<div style="background:linear-gradient(135deg,rgba(255,255,255,0.9),rgba(224,231,255,0.7));' +
    'border-radius:50px;padding:8px 20px;font-size:13px;font-weight:900;font-style:italic;color:#3730a3;' +
    'box-shadow:0 4px 16px rgba(124,58,237,0.12);border:1px solid rgba(255,255,255,0.8);margin-right:10px;">' +
    'Bloc\u00a0: <span style="color:#7C3AED;">' + fmt(room.blockId) + '</span></div>' +

    '<div style="background:linear-gradient(135deg,rgba(255,255,255,0.9),rgba(224,231,255,0.7));' +
    'border-radius:50px;padding:8px 20px;font-size:13px;font-weight:900;font-style:italic;color:#3730a3;' +
    'box-shadow:0 4px 16px rgba(124,58,237,0.12);border:1px solid rgba(255,255,255,0.8);">' +
    'Total\u00a0: <span style="color:#7C3AED;">' + String(items.length) + '</span></div>'
  );

  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>' +
    '<style>' +
    '*{box-sizing:border-box;margin:0;padding:0;}' +
    'body{font-family:Georgia,"Times New Roman",serif;' +
    'background:linear-gradient(160deg,#f5f3ff 0%,#ecfeff 50%,#fff0f9 100%);' +
    'min-height:100vh;padding:0 0 40px;}' +
    '.banner{background:linear-gradient(135deg,#7C3AED 0%,#06B6D4 60%,#2DD4BF 100%);' +
    'padding:32px 36px 26px;border-radius:0 0 36px 36px;' +
    'box-shadow:0 8px 40px rgba(124,58,237,0.35);margin-bottom:28px;overflow:hidden;}' +
    '.banner-title{color:white;font-size:28px;font-weight:900;font-style:italic;line-height:1.2;}' +
    '.banner-sub{color:rgba(255,255,255,0.82);font-size:13px;font-style:italic;margin-top:6px;}' +
    '.banner-date{color:rgba(255,255,255,0.9);font-size:12px;font-style:italic;margin-top:6px;}' +
    '.meta-row{display:flex;flex-wrap:wrap;gap:10px;padding:0 28px;margin-bottom:24px;}' +
    '.section-title{font-size:13px;font-weight:900;font-style:italic;color:#6d28d9;' +
    'letter-spacing:2px;text-transform:uppercase;padding:0 28px;margin-bottom:16px;opacity:0.7;}' +
    '.cards{padding:0 28px;}' +
    '.footer{text-align:center;font-style:italic;font-size:11px;color:#a78bfa;' +
    'padding:20px 28px 0;letter-spacing:1px;}' +
    '</style></head><body>' +
    '<div class="banner">' +
    '<div class="banner-title">Contenu de la salle \u2014 ' + roomName + '</div>' +
    '<div class="banner-sub">U-Auben Supplies Tracker \u00b7 Rapport de mat\u00e9riels</div>' +
    '<div class="banner-date">G\u00e9n\u00e9r\u00e9 le <strong>' + today + '</strong></div>' +
    '</div>' +
    '<div class="meta-row">' + metaPills + '</div>' +
    '<div class="section-title">\u00b7 Inventaire des mat\u00e9riels \u00b7</div>' +
    '<div class="cards">' + cardsHtml + '</div>' +
    '<div class="footer">\u00b7 U-Auben Supplies Tracker \u00b7 Version 1.1.1 \u00b7 Document g\u00e9n\u00e9r\u00e9 automatiquement \u00b7</div>' +
    '</body></html>';
}

// ── Composant ─────────────────────────────────────────────────────────────────

export default function SideBar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { appData } = useAppContext() as any;

  const menuBg   = appData?.settings?.menuBg;
  const menuLogo = appData?.settings?.menuLogo;
  const rooms: any[] = appData?.salles || [];

  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [isGenerating,   setIsGenerating]   = useState(false);

  const menuOptions = [
    { label: "Guide d'utilisation",     path: '/guide-viewer' },
    { label: 'À propos du développeur', path: '/about-dev'    },
  ];

  const handleDownload = async (room: any) => {
    setShowRoomPicker(false);
    setIsGenerating(true);
    try {
      const html = buildHtml(room, appData?.materiels || []);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setIsGenerating(false);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Données — ' + (room.name || room.id),
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF généré', 'Fichier enregistré :\n' + uri);
      }
    } catch (e: any) {
      setIsGenerating(false);
      Alert.alert('Erreur', 'Impossible de générer le PDF : ' + e.message);
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
                {'U-AUBEN\nSUPPLIES\nTRACKER'}
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
                <Text style={[styles.dlText, SBI]}>{'· Téléchargement\n  des données ·'}</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Text style={[styles.versionText, SBI]}>{'· Version 1.1.1 ·'}</Text>
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
                  <Text style={[styles.emptyText, SBI]}>Aucune salle enregistrée.</Text>
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
                          {'Bloc ' + (item.blockId || '—') + ' · Niveau ' + (item.level || '—')}
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
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={[styles.genText, SBI]}>Génération du PDF…</Text>
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
    backgroundColor: '#f5f3ff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '75%', overflow: 'hidden',
    shadowColor: '#7C3AED', shadowOpacity: 0.2, shadowRadius: 20, elevation: 20,
  },
  pickerHeader: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  pickerTitle: { color: 'white', fontSize: 18 },
  emptyWrap:   { padding: 40, alignItems: 'center' },
  emptyText:   { color: '#7C3AED', fontSize: 15 },

  roomRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#7C3AED', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  roomAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#7C3AED',
    justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden',
  },
  roomAvatarImg:    { width: '100%', height: '100%' },
  roomAvatarLetter: { color: 'white', fontSize: 20 },
  roomRowName:      { fontSize: 15, color: '#1a1a1a' },
  roomRowSub:       { fontSize: 12, color: '#888', marginTop: 2 },

  genOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  genBox: {
    backgroundColor: 'white', borderRadius: 24, padding: 36,
    alignItems: 'center', gap: 16,
    shadowColor: '#7C3AED', shadowOpacity: 0.25, shadowRadius: 24, elevation: 20,
  },
  genText: { color: '#7C3AED', fontSize: 16 },
});
    

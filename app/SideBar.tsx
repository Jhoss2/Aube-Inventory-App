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

// ── Bouton orange 3D bombé (en-têtes) ────────────────────────────────────────
function orangeBtn(label: string, width: string): string {
  return (
    '<th style="' +
    'width:' + width + ';' +
    'padding:6px 4px;' +
    'border:none;' +
    'background:transparent;' +
    '">' +
    '<div style="' +
    'background:linear-gradient(180deg,#ff9a3c 0%,#e85d04 40%,#c44b02 70%,#ff7a1a 100%);' +
    'border-radius:50px;' +
    'padding:8px 6px;' +
    'text-align:center;' +
    'font-family:Georgia,"Times New Roman",serif;' +
    'font-size:11px;font-weight:900;font-style:italic;' +
    'color:white;' +
    'text-shadow:0 1px 3px rgba(0,0,0,0.6);' +
    'box-shadow:' +
    '0 4px 0 #8B2500,' +
    '0 6px 12px rgba(0,0,0,0.5),' +
    'inset 0 1px 0 rgba(255,220,150,0.6),' +
    'inset 0 -2px 4px rgba(0,0,0,0.3);' +
    'border:1px solid rgba(255,160,60,0.4);' +
    '">' + label + '</div>' +
    '</th>'
  );
}

// ── Cellule glass blanche nacrée ──────────────────────────────────────────────
function glassCell(value: string, width: string, align?: string): string {
  var textAlign = align || 'center';
  var display = value ? value : '&nbsp;';
  return (
    '<td style="' +
    'width:' + width + ';' +
    'padding:4px;' +
    'border:none;' +
    'background:transparent;' +
    '">' +
    '<div style="' +
    'background:linear-gradient(135deg,' +
    'rgba(255,255,255,0.95) 0%,' +
    'rgba(220,235,255,0.85) 30%,' +
    'rgba(200,220,255,0.75) 60%,' +
    'rgba(230,240,255,0.90) 100%);' +
    'border-radius:50px;' +
    'padding:7px 10px;' +
    'text-align:' + textAlign + ';' +
    'font-family:Georgia,"Times New Roman",serif;' +
    'font-size:10px;font-weight:900;font-style:italic;' +
    'color:#1a1a3a;' +
    'box-shadow:' +
    'inset 0 1px 0 rgba(255,255,255,1),' +
    'inset 0 -1px 0 rgba(180,200,255,0.5),' +
    '0 2px 8px rgba(100,130,200,0.25),' +
    '0 1px 0 rgba(255,255,255,0.8);' +
    'border:1px solid rgba(200,215,255,0.6);' +
    'min-height:28px;' +
    'display:flex;align-items:center;justify-content:center;' +
    '">' + display + '</div>' +
    '</td>'
  );
}

// ── Grand bloc glass (commentaire / nom salle) ────────────────────────────────
function glassBigBlock(title: string, content: string, titleColor: string): string {
  return (
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;">' +

    // Titre bouton orange
    '<div style="' +
    'background:linear-gradient(180deg,#ff9a3c 0%,#e85d04 40%,#c44b02 70%,#ff7a1a 100%);' +
    'border-radius:50px;padding:8px 24px;margin-bottom:10px;' +
    'font-family:Georgia,"Times New Roman",serif;' +
    'font-size:13px;font-weight:900;font-style:italic;' +
    'color:white;text-shadow:0 1px 3px rgba(0,0,0,0.6);' +
    'box-shadow:0 4px 0 #8B2500,0 6px 12px rgba(0,0,0,0.5),' +
    'inset 0 1px 0 rgba(255,220,150,0.6),inset 0 -2px 4px rgba(0,0,0,0.3);' +
    'border:1px solid rgba(255,160,60,0.4);' +
    '">' + title + '</div>' +

    // Bloc glass
    '<div style="' +
    'width:100%;min-height:110px;' +
    'background:linear-gradient(135deg,' +
    'rgba(255,255,255,0.92) 0%,' +
    'rgba(210,228,255,0.75) 40%,' +
    'rgba(190,215,255,0.65) 70%,' +
    'rgba(225,238,255,0.85) 100%);' +
    'border-radius:22px;' +
    'padding:16px 20px;' +
    'box-shadow:' +
    'inset 0 2px 0 rgba(255,255,255,1),' +
    'inset 0 -2px 0 rgba(180,200,255,0.4),' +
    'inset 2px 0 0 rgba(255,255,255,0.7),' +
    '0 6px 20px rgba(80,120,200,0.3),' +
    '0 1px 0 rgba(255,255,255,0.9);' +
    'border:1.5px solid rgba(200,218,255,0.7);' +
    'display:flex;align-items:center;justify-content:center;' +
    '">' +
    '<div style="' +
    'font-family:Georgia,"Times New Roman",serif;' +
    'font-size:15px;font-weight:900;font-style:italic;' +
    'color:#1a1a3a;text-align:center;' +
    '">' + (content || '&nbsp;') + '</div>' +
    '</div>' +
    '</div>'
  );
}

// ── Générateur HTML principal ─────────────────────────────────────────────────
function buildHtml(room: any, materiels: any[]): string {
  var items = materiels.filter(function(m: any) {
    return String(m.roomId) === String(room.id);
  });

  var roomName = room.name
    ? room.name.charAt(0).toUpperCase() + room.name.slice(1).toLowerCase()
    : fmt(room.id);

  var today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // Colonnes et leur largeur
  var cols = [
    { label: 'Cat\u00e9gorie',         w: '12%' },
    { label: 'Nom',                    w: '12%' },
    { label: 'Marque',                 w: '9%'  },
    { label: 'Couleur',                w: '7%'  },
    { label: 'Quantit\u00e9',          w: '7%'  },
    { label: 'Etat',                   w: '8%'  },
    { label: 'D.A = Date Acquisition', w: '12%' },
    { label: 'D.D.V = Derni\u00e8re V\u00e9rif.', w: '12%' },
    { label: 'D.R = Renouvellement',   w: '12%' },
    { label: 'Image',                  w: '9%'  },
  ];

  // En-têtes
  var headerCells = cols.map(function(c) { return orangeBtn(c.label, c.w); }).join('');

  // Lignes de données
  var dataRows = '';
  if (items.length === 0) {
    dataRows = (
      '<tr><td colspan="10" style="padding:20px;text-align:center;' +
      'font-family:Georgia,serif;font-style:italic;color:rgba(255,255,255,0.6);font-size:13px;">' +
      'Aucun mat\u00e9riel enregistr\u00e9 pour cette salle.' +
      '</td></tr>'
    );
  } else {
    dataRows = items.map(function(item: any) {
      var imgCell = '';
      if (item.image) {
        imgCell = (
          '<td style="width:11%;padding:4px;border:none;background:transparent;">' +
          '<div style="' +
          'background:linear-gradient(135deg,rgba(255,255,255,0.95),rgba(220,235,255,0.85));' +
          'border-radius:16px;padding:4px;' +
          'box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 2px 8px rgba(100,130,200,0.25);' +
          'border:1px solid rgba(200,215,255,0.6);' +
          '">' +
          '<img src="' + item.image + '" style="width:100%;height:36px;object-fit:cover;border-radius:12px;display:block;"/>' +
          '</div>' +
          '</td>'
        );
      } else {
        imgCell = glassCell('\u2014', '11%');
      }

      return (
        '<tr>' +
        glassCell(fmt(item.category),              '12%') +
        glassCell(fmt(item.nom),                   '13%') +
        glassCell(fmt(item.marque),                '10%') +
        glassCell(fmt(item.couleur),               '8%')  +
        glassCell(fmt(item.quantite),              '7%')  +
        glassCell(fmt(item.etat),                  '9%')  +
        glassCell(fmtDate(item.dateAcquisition),   '10%') +
        glassCell(fmtDate(item.dateVerification),  '10%') +
        glassCell(fmtDate(item.dateRenouvellement),'10%') +
        imgCell +
        '</tr>'
      );
    }).join('');
  }

  // Titre principal
  var titleBtn = (
    '<div style="' +
    'display:inline-block;' +
    'background:linear-gradient(180deg,#ff9a3c 0%,#e85d04 40%,#c44b02 70%,#ff7a1a 100%);' +
    'border-radius:50px;padding:12px 40px;' +
    'font-family:Georgia,"Times New Roman",serif;' +
    'font-size:18px;font-weight:900;font-style:italic;' +
    'color:white;text-shadow:0 1px 4px rgba(0,0,0,0.6);' +
    'box-shadow:0 5px 0 #8B2500,0 8px 16px rgba(0,0,0,0.5),' +
    'inset 0 1px 0 rgba(255,220,150,0.6),inset 0 -2px 4px rgba(0,0,0,0.3);' +
    'border:1px solid rgba(255,160,60,0.4);' +
    'margin-bottom:22px;' +
    '">Liste du mat\u00e9riel</div>'
  );

  // Blocs bas
  var bottomBlocks = (
    '<div style="display:flex;gap:24px;margin-top:24px;align-items:flex-start;">' +
    glassBigBlock('Commentaire', '', '#ff7a1a') +
    glassBigBlock('Nom de la salle', roomName, '#ff7a1a') +
    '</div>'
  );

  // Footer
  var footer = (
    '<div style="text-align:center;margin-top:18px;' +
    'font-family:Georgia,serif;font-style:italic;font-size:10px;' +
    'color:rgba(255,255,255,0.45);letter-spacing:1px;">' +
    '\u00b7 U-Auben Supplies Tracker \u00b7 Version 1.1.1 \u00b7 ' + today + ' \u00b7' +
    '</div>'
  );

  return (
    '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>' +
    '<style>' +
    '@page{size:A4 landscape;margin:16px;}' +
    '*{box-sizing:border-box;margin:0;padding:0;}' +
    'body{' +
    'background:#0a0f2e;' +
    'min-height:100vh;padding:20px 24px;' +
    'font-family:Georgia,"Times New Roman",serif;' +
    '}' +
    'table{width:100%;border-collapse:separate;border-spacing:0 5px;}' +
    'thead tr{border:none;}' +
    'tbody tr{border:none;}' +
    '</style></head><body>' +

    // Titre
    '<div style="text-align:center;">' + titleBtn + '</div>' +

    // Tableau
    '<table>' +
    '<thead><tr>' + headerCells + '</tr></thead>' +
    '<tbody>' + dataRows + '</tbody>' +
    '</table>' +

    // Bas de page
    bottomBlocks +

    // Footer
    footer +

    '</body></html>'
  );
}

// ── Composant React Native ────────────────────────────────────────────────────

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
                <Text style={[styles.dlText, SBI]}>{'· T\u00e9l\u00e9chargement\n  des donn\u00e9es ·'}</Text>
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

 

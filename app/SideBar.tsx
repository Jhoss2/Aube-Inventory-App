import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ImageBackground, Image, Platform, FlatList, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAppContext } from '@/lib/app-context';

export default function SideBar({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const router = useRouter();
  const { appData } = useAppContext() as any;

  const menuBg = appData?.settings?.menuBg;
  const menuLogo = appData?.settings?.menuLogo;

  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const menuOptions = [
    { label: "Guide d'utilisation", path: '/guide-viewer' },
    { label: "À propos du développeur", path: '/about-dev' },
  ];

  const rooms: any[] = appData?.salles || [];

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (v: any) =>
    v !== undefined && v !== null && v !== '' ? String(v) : '—';

  const fmtDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return fmt(iso); }
  };

  const conditionLabel = (c: string) => {
    const map: Record<string, string> = {
      NEUF: '✨ Neuf', neuf: '✨ Neuf',
      BON: '👍 Bon état', bon: '👍 Bon état',
      'USÉ': '⚠️ Usé', usé: '⚠️ Usé',
      new: '✨ Neuf', good: '👍 Bon état',
      correct: '⚠️ Correct', damaged: '🔴 Endommagé',
    };
    return map[c] ?? fmt(c);
  };

  const imgCell = (uri: string | undefined) =>
    uri
      ? `<img src="${uri}" style="width:55px;height:42px;object-fit:cover;border-radius:8px;" />`
      : '<span style="color:#aaa;font-size:11px;">—</span>';

  // ── PDF HTML builder ──────────────────────────────────────────────────────
  const buildHtml = (room: any) => {
    const items: any[] = (appData?.materiels || []).filter(
      (m: any) => String(m.roomId) === String(room.id)
    );

    const roomName = room.name
      ? room.name.charAt(0).toUpperCase() + room.name.slice(1).toLowerCase()
      : fmt(room.id);

    const COLS = [
      'Nom de la salle', 'Catégorie', 'Matériel spécifique',
      'Marque', 'Couleur', 'Image',
      "Date d'acquisition", 'Dernière vérification',
      'État', 'Quantité', 'Informations', 'Renouvellement conseillé',
    ];

    const headerCells = COLS.map(c => `<th>${c}</th>`).join('');

    const dataRows = items.length
      ? items.map((item: any, idx: number) => `
        <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="tdc">${roomName}</td>
          <td class="tdc">${fmt(item.category)}</td>
          <td class="tdc">${fmt(item.nom)}</td>
          <td class="tdc">${fmt(item.marque)}</td>
          <td class="tdc">${fmt(item.couleur)}</td>
          <td class="tdc ctr">${imgCell(item.image)}</td>
          <td class="tdc">${fmtDate(item.dateAcquisition)}</td>
          <td class="tdc">${fmtDate(item.dateVerification)}</td>
          <td class="tdc">${conditionLabel(item.etat)}</td>
          <td class="tdc ctr">${fmt(item.quantite)}</td>
          <td class="tdc">${fmt(item.infos)}</td>
          <td class="tdc">${fmtDate(item.dateRenouvellement)}</td>
        </tr>`).join('')
      : `<tr><td colspan="12" class="td-empty">Aucun matériel enregistré pour cette salle.</td></tr>`;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; background: #fff0f3; }

  .banner {
    background: linear-gradient(135deg, #8B0000 0%, #b30000 100%);
    padding: 26px 32px 20px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 4px solid #6a0000;
  }
  .banner-title { color: white; font-size: 34px; font-weight: 900; font-style: italic; line-height: 1.15; }
  .banner-sub { color: rgba(255,255,255,0.8); font-size: 13px; font-style: italic; margin-top: 5px; }
  .banner-date { color: rgba(255,255,255,0.9); font-size: 13px; font-style: italic; text-align: right; }

  .meta-row {
    background: #1a1a2e; color: white;
    display: flex; gap: 36px; padding: 11px 32px;
    font-style: italic; font-weight: bold; font-size: 13px;
  }
  .meta-row span { color: #ffb3c1; }

  .table-wrap { padding: 22px 18px 40px; }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 5px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 11.5px;
  }

  thead tr th {
    background: #e05c00; color: white;
    font-weight: 900; font-style: italic;
    padding: 11px 8px; text-align: center; vertical-align: middle;
  }
  thead tr th:first-child { border-radius: 12px 0 0 12px; }
  thead tr th:last-child  { border-radius: 0 12px 12px 0; }

  .row-even td { background: #ffe4e8; }
  .row-odd  td { background: #ffd0d8; }

  .tdc {
    padding: 9px 8px; color: #1a1a1a;
    font-style: italic; font-weight: bold;
    vertical-align: middle; text-align: left;
    border-top: 1px solid rgba(200,100,120,0.25);
    border-bottom: 1px solid rgba(200,100,120,0.25);
  }
  tr .tdc:first-child {
    border-left: 1px solid rgba(200,100,120,0.25);
    border-radius: 12px 0 0 12px;
  }
  tr .tdc:last-child {
    border-right: 1px solid rgba(200,100,120,0.25);
    border-radius: 0 12px 12px 0;
  }
  .ctr { text-align: center; }

  .td-empty {
    text-align: center; color: #999; padding: 24px;
    font-style: italic; font-size: 13px;
    background: #fff0f3; border-radius: 12px;
  }

  .footer {
    text-align: center; font-style: italic; font-size: 11px;
    color: #8B0000; padding: 14px 18px;
    border-top: 1.5px solid #e8a0a8; margin: 0 18px;
  }
</style>
</head>
<body>

<div class="banner">
  <div>
    <div class="banner-title">Contenu de la salle — ${roomName}</div>
    <div class="banner-sub">U-Auben Supplies Tracker · Rapport de matériels</div>
  </div>
  <div class="banner-date">
    Généré le<br/>
    <strong>${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
  </div>
</div>

<div class="meta-row">
  <div>NIVEAU : <span>${fmt(room.level)}</span></div>
  <div>BLOC : <span>${fmt(room.blockId)}</span></div>
  <div>TOTAL MATÉRIELS : <span>${items.length}</span></div>
</div>

<div class="table-wrap">
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${dataRows}</tbody>
  </table>
</div>

<div class="footer">· U-Auben Supplies Tracker · Version 1.1.1 · Document généré automatiquement ·</div>
</body>
</html>`;
  };

  // ── Download handler ──────────────────────────────────────────────────────
  const handleDownload = async (room: any) => {
    setShowRoomPicker(false);
    setIsGenerating(true);
    try {
      const html = buildHtml(room);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setIsGenerating(false);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Données — ${room.name}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF généré', `Fichier enregistré :\n${uri}`);
      }
    } catch (e: any) {
      setIsGenerating(false);
      Alert.alert('Erreur', `Impossible de générer le PDF : ${e.message}`);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.container}>
          <ImageBackground
            source={menuBg ? { uri: menuBg } : { uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000' }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          >
            <View style={styles.blueOverlay} />
          </ImageBackground>

          <View style={styles.sidebarDrawer}>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <Text style={styles.titleText}>U-AUBEN{'\n'}SUPPLIES{'\n'}TRACKER</Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={32} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.navContainer}
              contentContainerStyle={styles.navContent}
              showsVerticalScrollIndicator={false}
            >
              {menuOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.navButton}
                  onPress={() => { onClose(); router.push(option.path as any); }}
                >
                  <Text style={styles.navText}>· {option.label} ·</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => setShowRoomPicker(true)}
              >
                <Feather name="download" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.downloadText}>· Téléchargement{'\n'}  des données ·</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.versionText}>· Version 1.1.1 ·</Text>
              <View style={styles.logoOuter}>
                <View style={styles.logoGradient}>
                  {menuLogo
                    ? <Image source={{ uri: menuLogo }} style={styles.logoImage} />
                    : <View style={styles.logoPlaceholder}><Text style={styles.logoText}>Logo</Text></View>
                  }
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.closeZone} onPress={onClose} activeOpacity={1} />
        </View>
      </Modal>

      {/* ── ROOM PICKER ── */}
      <Modal transparent visible={showRoomPicker} animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choisir une salle</Text>
              <TouchableOpacity onPress={() => setShowRoomPicker(false)}>
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {rooms.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Aucune salle enregistrée.</Text>
              </View>
            ) : (
              <FlatList
                data={rooms}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.roomRow} onPress={() => handleDownload(item)}>
                    <View style={styles.roomAvatar}>
                      {item.image
                        ? <Image source={{ uri: item.image }} style={styles.roomAvatarImg} />
                        : <Text style={styles.roomAvatarLetter}>{item.name?.[0]?.toUpperCase() ?? '?'}</Text>
                      }
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roomRowName}>
                        {item.name
                          ? item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()
                          : `Salle ${item.id}`}
                      </Text>
                      <Text style={styles.roomRowSub}>
                        Bloc {item.blockId ?? '—'} · Niveau {item.level ?? '—'}
                      </Text>
                    </View>
                    <Feather name="download" size={20} color="#8B0000" />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ── GENERATING ── */}
      {isGenerating && (
        <Modal transparent visible animationType="fade">
          <View style={styles.generatingOverlay}>
            <View style={styles.generatingBox}>
              <ActivityIndicator size="large" color="#8B0000" />
              <Text style={styles.generatingText}>Génération du PDF…</Text>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  blueOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30, 58, 138, 0.4)' },
  sidebarDrawer: {
    width: '50%', height: '100%', backgroundColor: 'rgba(139, 0, 0, 0.92)',
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15,
  },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleText: {
    color: 'white', fontWeight: '900', fontSize: 35, lineHeight: 37, fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', textTransform: 'uppercase',
  },
  navContainer: { flex: 1 },
  navContent: { paddingTop: 24, alignItems: 'center', paddingBottom: 16 },
  navButton: { marginBottom: 24, paddingHorizontal: 15, width: '100%' },
  navText: {
    color: 'white', fontWeight: 'bold', fontSize: 22, textAlign: 'center', fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
  },
  downloadButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14,
    marginTop: 10, width: '88%',
  },
  downloadText: {
    color: 'white', fontWeight: 'bold', fontSize: 16, fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', flex: 1,
  },
  footer: { paddingBottom: 40, alignItems: 'center' },
  versionText: { color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', fontSize: 16, fontStyle: 'italic', marginBottom: 20 },
  logoOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoGradient: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: '#fbcfe8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: 'bold', fontStyle: 'italic', color: '#8B0000' },
  closeZone: { flex: 1, height: '100%' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#fff0f3', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '75%', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  pickerHeader: {
    backgroundColor: '#8B0000', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  pickerTitle: {
    color: 'white', fontSize: 20, fontWeight: '900', fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  roomRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  roomAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#8B0000',
    justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden',
  },
  roomAvatarImg: { width: '100%', height: '100%' },
  roomAvatarLetter: {
    color: 'white', fontSize: 20, fontWeight: '900', fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  roomRowName: {
    fontSize: 16, fontWeight: '900', fontStyle: 'italic', color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  roomRowSub: {
    fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyText: {
    color: '#8B0000', fontStyle: 'italic', fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  generatingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  generatingBox: {
    backgroundColor: 'white', borderRadius: 20, padding: 36,
    alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  generatingText: {
    color: '#8B0000', fontSize: 16, fontWeight: '900', fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
});
      

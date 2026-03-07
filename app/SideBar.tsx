import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ImageBackground, Image, Platform, FlatList,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAppContext } from '@/lib/app-context';

// ── Police globale ────────────────────────────────────────────────────────────
const SBI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

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

  // ── Helpers PDF ───────────────────────────────────────────────────────────
  const fmt = (v: any) => (v !== undefined && v !== null && v !== '' ? String(v) : '—');

  const fmtDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return fmt(iso); }
  };

  const etatBadge = (e: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      NEUF:  { label: '✨ Neuf',     bg: 'linear-gradient(135deg,#7C3AED,#A78BFA)', color: 'white' },
      neuf:  { label: '✨ Neuf',     bg: 'linear-gradient(135deg,#7C3AED,#A78BFA)', color: 'white' },
      BON:   { label: '👍 Bon état', bg: 'linear-gradient(135deg,#06B6D4,#2DD4BF)', color: 'white' },
      bon:   { label: '👍 Bon état', bg: 'linear-gradient(135deg,#06B6D4,#2DD4BF)', color: 'white' },
      'USÉ': { label: '⚠️ Usé',     bg: 'linear-gradient(135deg,#F472B6,#FB923C)', color: 'white' },
      usé:   { label: '⚠️ Usé',     bg: 'linear-gradient(135deg,#F472B6,#FB923C)', color: 'white' },
      damaged: { label: '🔴 Endommagé', bg: 'linear-gradient(135deg,#EF4444,#B91C1C)', color: 'white' },
    };
    const d = map[e] ?? { label: fmt(e), bg: 'linear-gradient(135deg,#94A3B8,#64748B)', color: 'white' };
    return `<span style="
      background:${d.bg};
      color:${d.color};
      padding:4px 14px;
      border-radius:50px;
      font-size:11px;
      font-weight:900;
      font-style:italic;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.18);
    ">${d.label}</span>`;
  };

  // ── Générateur HTML → PDF Liquid Glass ───────────────────────────────────
  const buildHtml = (room: any) => {
    const items: any[] = (appData?.materiels || []).filter(
      (m: any) => String(m.roomId) === String(room.id)
    );
    const roomName =
      room.name
        ? room.name.charAt(0).toUpperCase() + room.name.slice(1).toLowerCase()
        : fmt(room.id);

    // ── Une "card" par matériel ──────────────────────────────────────────
    const cards = items.length
      ? items.map((item: any, idx: number) => {
          const imgHtml = item.image
            ? `<img src="${item.image}" style="
                width:100%; height:130px; object-fit:cover;
                border-radius:18px;
                box-shadow:0 4px 16px rgba(124,58,237,0.18);
                display:block; margin-bottom:10px;
              "/>`
            : `<div style="
                width:100%; height:130px; border-radius:18px;
                background:linear-gradient(135deg,#e0e7ff,#f0fdf4);
                display:flex; align-items:center; justify-content:center;
                font-size:36px; font-style:italic; font-weight:900;
                color:#a78bfa; margin-bottom:10px;
                box-shadow:0 4px 16px rgba(124,58,237,0.10);
              ">${item.nom?.[0]?.toUpperCase() ?? '?'}</div>`;

          return `
          <div style="
            background: ${idx % 2 === 0
              ? 'linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(224,231,255,0.60) 100%)'
              : 'linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(207,250,254,0.55) 100%)'};
            border-radius: 24px;
            padding: 18px 20px;
            margin-bottom: 18px;
            box-shadow:
              0 8px 32px rgba(124,58,237,0.10),
              0 1.5px 0 rgba(255,255,255,0.9) inset,
              0 -1px 0 rgba(124,58,237,0.08) inset;
            border: 1.5px solid rgba(255,255,255,0.75);
            backdrop-filter: blur(12px);
            page-break-inside: avoid;
          ">

            <!-- IMAGE + NOM -->
            ${imgHtml}
            <div style="
              font-size:17px; font-weight:900; font-style:italic;
              color:#3730a3; margin-bottom:12px; letter-spacing:0.3px;
            ">${fmt(item.nom)}</div>

            <!-- GRILLE DE DÉTAILS : 2 colonnes -->
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">

              ${pill('Catégorie',   fmt(item.category),                  '#ede9fe','#5b21b6')}
              ${pill('Marque',      fmt(item.marque),                    '#e0f2fe','#0369a1')}
              ${pill('Couleur',     fmt(item.couleur),                   '#fce7f3','#9d174d')}
              ${pill('Quantité',    fmt(item.quantite),                  '#dcfce7','#166534')}
              ${pill('Acquisition', fmtDate(item.dateAcquisition),       '#fef9c3','#854d0e')}
              ${pill('Vérification',fmtDate(item.dateVerification),      '#f0fdf4','#14532d')}
              ${pill('Renouvellement', fmtDate(item.dateRenouvellement), '#fff7ed','#9a3412')}

            </div>

            <!-- ÉTAT badge -->
            <div style="margin-bottom:${item.infos ? '10px' : '0'};">
              ${etatBadge(item.etat ?? '')}
            </div>

            <!-- NOTES -->
            ${item.infos ? `
            <div style="
              background: rgba(255,255,255,0.6);
              border-radius: 14px;
              padding: 10px 14px;
              font-size: 12px; font-style:italic; font-weight:700;
              color: #475569;
              border: 1px solid rgba(148,163,184,0.25);
              box-shadow: 0 1px 4px rgba(0,0,0,0.06) inset;
            ">📝 ${fmt(item.infos)}</div>` : ''}

          </div>`;
        }).join('')
      : `<div style="
          text-align:center; padding:48px; border-radius:24px;
          background:rgba(255,255,255,0.7);
          font-style:italic; font-size:15px; color:#94a3b8;
          box-shadow: 0 4px 24px rgba(124,58,237,0.08);
          border:1.5px solid rgba(255,255,255,0.8);
        ">Aucun matériel enregistré pour cette salle.</div>`;

    return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    background: linear-gradient(160deg, #f5f3ff 0%, #ecfeff 50%, #fff0f9 100%);
    min-height: 100vh;
    padding: 0 0 40px;
  }

  /* ── BANNIÈRE HEADER ── */
  .banner {
    background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 60%, #2DD4BF 100%);
    padding: 32px 36px 26px;
    border-radius: 0 0 36px 36px;
    box-shadow: 0 8px 40px rgba(124,58,237,0.35);
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
  }
  .banner::before {
    content:'';
    position:absolute; top:-40px; right:-40px;
    width:180px; height:180px; border-radius:50%;
    background: rgba(255,255,255,0.12);
  }
  .banner::after {
    content:'';
    position:absolute; bottom:-30px; left:30%;
    width:120px; height:120px; border-radius:50%;
    background: rgba(255,255,255,0.08);
  }
  .banner-title {
    color: white;
    font-size: 30px; font-weight:900; font-style:italic;
    line-height:1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.18);
  }
  .banner-sub {
    color: rgba(255,255,255,0.82);
    font-size:13px; font-style:italic; margin-top:6px;
  }
  .banner-date {
    color:rgba(255,255,255,0.9); font-size:12px;
    font-style:italic; text-align:right; margin-top:8px;
  }

  /* ── MÉTA PILLS ── */
  .meta-row {
    display:flex; gap:12px; padding: 0 28px; margin-bottom:28px;
    flex-wrap:wrap;
  }
  .meta-pill {
    background: linear-gradient(135deg,rgba(255,255,255,0.9),rgba(224,231,255,0.7));
    border-radius: 50px;
    padding: 8px 20px;
    font-size:13px; font-weight:900; font-style:italic;
    color:#3730a3;
    box-shadow: 0 4px 16px rgba(124,58,237,0.12),
                0 1px 0 rgba(255,255,255,1) inset;
    border: 1px solid rgba(255,255,255,0.8);
  }
  .meta-pill span { color:#7C3AED; }

  /* ── TITRE SECTION ── */
  .section-title {
    font-size:14px; font-weight:900; font-style:italic;
    color:#6d28d9; letter-spacing:2px; text-transform:uppercase;
    padding: 0 28px; margin-bottom:16px;
    opacity:0.7;
  }

  /* ── CONTENU ── */
  .cards-wrap { padding: 0 28px; }

  /* ── FOOTER ── */
  .footer {
    text-align:center; font-style:italic; font-size:11px;
    color:#a78bfa; padding:20px 28px 0;
    letter-spacing:1px;
  }
</style>
</head><body>

<!-- BANNIÈRE -->
<div class="banner">
  <div class="banner-title">Contenu de la salle — ${roomName}</div>
  <div class="banner-sub">U-Auben Supplies Tracker · Rapport de matériels</div>
  <div class="banner-date">
    Généré le <strong>${new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</strong>
  </div>
</div>

<!-- MÉTA -->
<div class="meta-row">
  <div class="meta-pill">Niveau : <span>${fmt(room.level)}</span></div>
  <div class="meta-pill">Bloc : <span>${fmt(room.blockId)}</span></div>
  <div class="meta-pill">Total matériels : <span>${items.length}</span></div>
</div>

<!-- TITRE -->
<div class="section-title">· Inventaire des matériels ·</div>

<!-- CARDS -->
<div class="cards-wrap">${cards}</div>

<!-- FOOTER -->
<div class="footer">· U-Auben Supplies Tracker · Version 1.1.1 · Document généré automatiquement ·</div>

</body></html>`;
  };

  // ── Téléchargement ────────────────────────────────────────────────────────
  const handleDownload = async (room: any) => {
    setShowRoomPicker(false);
    setIsGenerating(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: buildHtml(room), base64: false });
      setIsGenerating(false);
      if (await Sharing.isAvailableAsync()) {
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
                U-AUBEN{'\n'}SUPPLIES{'\n'}TRACKER
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
                  <Text style={[styles.navText, SBI]}>· {opt.label} ·</Text>
                </TouchableOpacity>
              ))}

              {/* ── BOUTON TÉLÉCHARGEMENT ── */}
              <TouchableOpacity
                style={styles.dlBtn}
                onPress={() => setShowRoomPicker(true)}
              >
                <Feather name="download" size={20} color="white" />
                <Text style={[styles.dlText, SBI]}>· Téléchargement{'\n'}  des données ·</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Text style={[styles.versionText, SBI]}>· Version 1.1.1 ·</Text>
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
                  keyExtractor={item => String(item.id)}
                  contentContainerStyle={{ padding: 16 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.roomRow} onPress={() => handleDownload(item)}>
                      <View style={styles.roomAvatar}>
                        {item.image
                          ? <Image source={{ uri: item.image }} style={styles.roomAvatarImg} />
                          : <Text style={[styles.roomAvatarLetter, SBI]}>
                              {item.name?.[0]?.toUpperCase() ?? '?'}
                            </Text>
                        }
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.roomRowName, SBI]}>
                          {item.name
                            ? item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()
                            : `Salle ${item.id}`}
                        </Text>
                        <Text style={[styles.roomRowSub, SBI]}>
                          Bloc {item.blockId ?? '—'} · Niveau {item.level ?? '—'}
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

// ── Fonction utilitaire pill ──────────────────────────────────────────────────
function pill(label: string, value: string, bg: string, color: string): string {
  return `<div style="
    background:${bg};
    border-radius:50px;
    padding:5px 14px;
    display:inline-flex;
    align-items:center;
    gap:6px;
    box-shadow:0 2px 8px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset;
    border:1px solid rgba(255,255,255,0.7);
    margin:2px;
  ">
    <span style="font-size:10px;font-style:italic;font-weight:700;color:#64748b;">${label}</span>
    <span style="font-size:12px;font-style:italic;font-weight:900;color:${color};">${value}</span>
  </div>`;
}

// ── Styles React Native ───────────────────────────────────────────────────────
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
    background: 'linear-gradient(135deg,#7C3AED,#06B6D4)',
    backgroundColor: '#7C3AED',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  pickerTitle: { color: 'white', fontSize: 18 },
  emptyWrap:   { padding: 40, align

// app/aube-library.tsx
// Bibliothèque de Aube — Importer des documents pour enrichir son intelligence

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, BookOpen, Plus, Trash2, FileText, Database, Zap } from 'lucide-react-native';
import {
  initLibrary, choisirDocument, ingererDocument,
  statsLibrairie, supprimerDocument, viderLibrairie,
} from '@/lib/aube-library';

const BSI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

export default function AubeLibraryScreen() {
  const router = useRouter();

  const [stats,       setStats]       = useState<any>({ documents: 0, chunks: 0, avecEmbeddings: 0, liste: [] });
  const [loading,     setLoading]     = useState(false);
  const [progres,     setProgres]     = useState<any>(null);
  const [initialise,  setInitialise]  = useState(false);

  const chargerStats = useCallback(async () => {
    var s = await statsLibrairie();
    setStats(s);
  }, []);

  useEffect(() => {
    initLibrary().then(function() {
      setInitialise(true);
      chargerStats();
    }).catch(function() {});
  }, []);

  const handleImporter = async () => {
    if (loading) return;

    var doc = await choisirDocument();
    if (!doc) return;

    setLoading(true);
    setProgres({ etape: 'debut', message: 'Démarrage...', progression: 0 });

    var resultat = await ingererDocument(
      doc.uri,
      doc.name || 'Document',
      doc.mimeType || 'txt',
      function(p: any) { setProgres(p); }
    );

    setLoading(false);
    setProgres(null);

    if (resultat.succes) {
      await chargerStats();
      Alert.alert(
        '✅ Document intégré !',
        '"' + (doc.name || 'Document') + '" a été ajouté à la bibliothèque d\'Aube.\n' +
        resultat.nbChunks + ' sections ont été indexées.',
        [{ text: 'Super !', style: 'default' }]
      );
    } else {
      Alert.alert('❌ Erreur', resultat.message || 'Impossible d\'importer ce document.');
    }
  };

  const handleSupprimerDoc = (doc: any) => {
    Alert.alert(
      'Supprimer ce document ?',
      '"' + doc.nom + '" sera retiré de la bibliothèque d\'Aube.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await supprimerDocument(doc.id);
            await chargerStats();
          },
        },
      ]
    );
  };

  const handleVider = () => {
    Alert.alert(
      'Vider toute la bibliothèque ?',
      'Tous les documents et leurs connaissances seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout vider',
          style: 'destructive',
          onPress: async () => {
            await viderLibrairie();
            await chargerStats();
          },
        },
      ]
    );
  };

  const pctEmbeds = stats.chunks > 0
    ? Math.round((stats.avecEmbeddings / stats.chunks) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.headerPill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={26} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <BookOpen size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={[styles.headerTitle, BSI]}>BIBLIOTHÈQUE D'AUBE</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Description */}
        <View style={[styles.infoCard, styles.glow]}>
          <Text style={[styles.infoTitle, BSI]}>Comment ça fonctionne ?</Text>
          <Text style={[styles.infoText, BSI]}>
            Importez n'importe quel document (PDF, TXT, MD...) et Aube en extrait les connaissances. 
            Elle pourra ensuite répondre à vos questions en s'appuyant sur ces documents.
          </Text>
          <View style={styles.infoTags}>
            {['📚 Grammaire', '🧠 Philosophie', '📋 Rapports', '📖 Manuels', '🔬 Sciences'].map(function(tag) {
              return (
                <View key={tag} style={styles.tag}>
                  <Text style={[styles.tagText, BSI]}>{tag}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Statistiques */}
        <View style={[styles.statsCard, styles.glow]}>
          <Text style={[styles.sectionTitle, BSI]}>Intelligence accumulée</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <FileText size={24} color="#8B0000" />
              <Text style={[styles.statNum, BSI]}>{stats.documents}</Text>
              <Text style={[styles.statLabel, BSI]}>Documents</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Database size={24} color="#1A237E" />
              <Text style={[styles.statNum, BSI]}>{stats.chunks}</Text>
              <Text style={[styles.statLabel, BSI]}>Sections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Zap size={24} color="#059669" />
              <Text style={[styles.statNum, BSI]}>{pctEmbeds}%</Text>
              <Text style={[styles.statLabel, BSI]}>Indexées</Text>
            </View>
          </View>

          {stats.chunks > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: pctEmbeds + '%' as any }]} />
            </View>
          )}
        </View>

        {/* Bouton importer */}
        <TouchableOpacity
          style={[styles.importBtn, styles.glow, loading && styles.importBtnDisabled]}
          onPress={handleImporter}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="white" style={{ marginRight: 10 }} />
            : <Plus size={22} color="white" style={{ marginRight: 10 }} />
          }
          <Text style={[styles.importBtnText, BSI]}>
            {loading ? 'Importation en cours...' : 'Importer un document'}
          </Text>
        </TouchableOpacity>

        {/* Barre de progression */}
        {progres && (
          <View style={[styles.progresCard, styles.glow]}>
            <Text style={[styles.progresEtape, BSI]}>{progres.message}</Text>
            {progres.progression !== undefined && (
              <View style={styles.progressBar}>
                <View style={[styles.progressFillGreen, { width: progres.progression + '%' as any }]} />
              </View>
            )}
          </View>
        )}

        {/* Liste des documents */}
        {stats.liste && stats.liste.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, BSI]}>Documents importés</Text>
              <TouchableOpacity onPress={handleVider} style={styles.viderBtn}>
                <Trash2 size={16} color="#dc2626" />
                <Text style={[styles.viderText, BSI]}>Tout vider</Text>
              </TouchableOpacity>
            </View>

            {stats.liste.map(function(doc: any, idx: number) {
              var date = '';
              try { date = new Date(doc.timestamp).toLocaleDateString('fr-FR'); } catch(e) {}
              return (
                <View key={idx} style={[styles.docCard, styles.glow]}>
                  <View style={styles.docIcon}>
                    <FileText size={20} color="white" />
                  </View>
                  <View style={styles.docInfo}>
                    <Text style={[styles.docNom, BSI]} numberOfLines={1}>{doc.nom}</Text>
                    <Text style={[styles.docMeta, BSI]}>
                      {doc.nb_chunks} sections · {doc.type.toUpperCase()} · {date}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.docDeleteBtn}
                    onPress={() => handleSupprimerDoc(doc)}
                  >
                    <Trash2 size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* État vide */}
        {(!stats.liste || stats.liste.length === 0) && !loading && (
          <View style={styles.emptyWrap}>
            <BookOpen size={48} color="#ccc" />
            <Text style={[styles.emptyText, BSI]}>
              La bibliothèque est vide.
            </Text>
            <Text style={[styles.emptyHint, BSI]}>
              Importez des documents pour enrichir l'intelligence d'Aube.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#FFE4E8' },
  scroll: { padding: 16, paddingTop: 20 },

  glow: { elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },

  headerPill: {
    backgroundColor: '#8B0000', borderRadius: 50, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 20,
  },
  backBtn:     { width: 36 },
  headerCenter:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: 'white', fontSize: 16, letterSpacing: 1 },

  infoCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 18,
    marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#8B0000',
  },
  infoTitle: { fontSize: 15, color: '#8B0000', marginBottom: 8 },
  infoText:  { fontSize: 13, color: '#444', lineHeight: 20, marginBottom: 12 },
  infoTags:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:       { backgroundColor: '#FFE4E8', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:   { fontSize: 11, color: '#8B0000' },

  statsCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 18, marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, color: '#1A237E', marginBottom: 14 },
  statsRow:     { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem:     { alignItems: 'center', gap: 4 },
  statNum:      { fontSize: 28, color: '#1A237E', marginTop: 4 },
  statLabel:    { fontSize: 11, color: '#888' },
  statDivider:  { width: 1, height: 50, backgroundColor: '#eee' },

  progressBar: {
    height: 6, backgroundColor: '#eee', borderRadius: 3, marginTop: 14, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: '#059669', borderRadius: 3,
  },
  progressFillGreen: {
    height: '100%', backgroundColor: '#1A237E', borderRadius: 3,
  },

  importBtn: {
    backgroundColor: '#1A237E', borderRadius: 50, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 24, marginBottom: 14,
  },
  importBtnDisabled: { opacity: 0.6 },
  importBtnText:     { color: 'white', fontSize: 15, letterSpacing: 1 },

  progresCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 14,
  },
  progresEtape: { fontSize: 13, color: '#333', marginBottom: 8 },

  section:       { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viderBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viderText:     { fontSize: 12, color: '#dc2626' },

  docCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12,
  },
  docIcon:      { width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B0000', justifyContent: 'center', alignItems: 'center' },
  docInfo:      { flex: 1 },
  docNom:       { fontSize: 14, color: '#1a1a1a', marginBottom: 3 },
  docMeta:      { fontSize: 11, color: '#888' },
  docDeleteBtn: { padding: 6 },

  emptyWrap: { alignItems: 'center', paddingTop: 40, paddingBottom: 20, gap: 12 },
  emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center' },
  emptyHint: { fontSize: 13, color: '#ccc', textAlign: 'center' },
});

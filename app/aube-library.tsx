// app/aube-library.tsx
// Bibliothèque de Aube — Upload illimité, conversion, insertion RAG

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, BookOpen, Plus, Trash2, FileText, Zap, RefreshCw } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  initLibrary, ingererDocument, statsLibrairie,
  supprimerDocument, viderLibrairie,
} from '@/lib/aube-library';

const BSI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

type DocEnAttente = {
  uri: string;
  nom: string;
  type: string;
  taille: number;
  statut: 'attente' | 'conversion' | 'ok' | 'erreur';
  message: string;
  progression: number;
};

export default function AubeLibraryScreen() {
  const router = useRouter();

  const [stats,       setStats]       = useState<any>({ documents: 0, chunks: 0, avecEmbeddings: 0, liste: [] });
  const [enAttente,   setEnAttente]   = useState<DocEnAttente[]>([]);
  const [convertissant, setConvertissant] = useState(false);
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

  // ── Sélectionner des documents (multiple) ──
  const handleSelectionner = async () => {
    try {
      var result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'text/markdown',
               'text/csv', 'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               '*/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) return;

      var assets = result.assets || [];
      if (assets.length === 0) return;

      var nouveaux: DocEnAttente[] = assets.map(function(a: any) {
        return {
          uri: a.uri,
          nom: a.name || 'Document',
          type: a.mimeType || 'txt',
          taille: a.size || 0,
          statut: 'attente' as const,
          message: 'En attente de conversion',
          progression: 0,
        };
      });

      setEnAttente(function(prev) {
        // Éviter les doublons par nom
        var existants = prev.map(function(p) { return p.nom; });
        var filtres = nouveaux.filter(function(n) { return existants.indexOf(n.nom) === -1; });
        return prev.concat(filtres);
      });
    } catch(e: any) {
      Alert.alert('Erreur', 'Impossible de sélectionner les fichiers : ' + (e.message || e));
    }
  };

  // ── Supprimer un doc de la liste d'attente ──
  const retirerEnAttente = (nom: string) => {
    setEnAttente(function(prev) { return prev.filter(function(d) { return d.nom !== nom; }); });
  };

  // ── CONVERTIR — le cœur du système ──
  const handleConvertir = async () => {
    if (enAttente.length === 0) {
      Alert.alert('Aucun document', 'Sélectionnez d\'abord des documents à convertir.');
      return;
    }

    var aConvertir = enAttente.filter(function(d) { return d.statut === 'attente' || d.statut === 'erreur'; });
    if (aConvertir.length === 0) {
      Alert.alert('Tout est déjà converti', 'Tous les documents sont prêts.');
      return;
    }

    setConvertissant(true);

    for (var i = 0; i < aConvertir.length; i++) {
      var doc = aConvertir[i];
      var nomDoc = doc.nom;

      // Passer en mode conversion
      setEnAttente(function(prev) {
        return prev.map(function(d) {
          if (d.nom === nomDoc) return { ...d, statut: 'conversion' as const, message: 'Analyse du document...', progression: 5 };
          return d;
        });
      });

      var resultat = await ingererDocument(
        doc.uri,
        doc.nom,
        doc.type,
        function(p: any) {
          setEnAttente(function(prev) {
            return prev.map(function(d) {
              if (d.nom === nomDoc) {
                return {
                  ...d,
                  statut: 'conversion' as const,
                  message: p.message || 'Conversion...',
                  progression: p.progression || p.progression === 0 ? p.progression : 50,
                };
              }
              return d;
            });
          });
        }
      );

      // Mettre à jour le statut final
      setEnAttente(function(prev) {
        return prev.map(function(d) {
          if (d.nom === nomDoc) {
            return {
              ...d,
              statut: resultat.succes ? 'ok' as const : 'erreur' as const,
              message: resultat.succes
                ? '✅ ' + resultat.nbChunks + ' sections intégrées dans la mémoire d\'Aube'
                : '❌ ' + (resultat.message || 'Erreur'),
              progression: resultat.succes ? 100 : 0,
            };
          }
          return d;
        });
      });

      // Recharger les stats après chaque doc
      await chargerStats();

      // Petite pause entre les documents
      if (i < aConvertir.length - 1) {
        await new Promise(function(r) { setTimeout(r, 300); });
      }
    }

    setConvertissant(false);
  };

  // ── Supprimer un doc de la bibliothèque ──
  const handleSupprimerDoc = (doc: any) => {
    Alert.alert(
      'Supprimer "' + doc.nom + '" ?',
      'Ce document sera retiré de la mémoire d\'Aube.',
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
      'Toutes les connaissances importées seront effacées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout vider',
          style: 'destructive',
          onPress: async () => {
            await viderLibrairie();
            await chargerStats();
            setEnAttente([]);
          },
        },
      ]
    );
  };

  var nbAttente  = enAttente.filter(function(d) { return d.statut === 'attente' || d.statut === 'erreur'; }).length;
  var nbOk       = enAttente.filter(function(d) { return d.statut === 'ok'; }).length;
  var nbErreur   = enAttente.filter(function(d) { return d.statut === 'erreur'; }).length;
  var pctEmbeds  = stats.chunks > 0 ? Math.round((stats.avecEmbeddings / stats.chunks) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.headerPill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36 }}>
            <ChevronLeft size={26} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <BookOpen size={18} color="white" />
            <Text style={[styles.headerTitle, BSI]}>BIBLIOTHÈQUE D'AUBE</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Stats globales */}
        <View style={[styles.card, styles.glow]}>
          <Text style={[styles.cardTitle, BSI]}>Intelligence accumulée</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, BSI]}>{stats.documents}</Text>
              <Text style={[styles.statLabel, BSI]}>Documents</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, BSI]}>{stats.chunks}</Text>
              <Text style={[styles.statLabel, BSI]}>Sections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, BSI]}>{pctEmbeds}%</Text>
              <Text style={[styles.statLabel, BSI]}>Indexées</Text>
            </View>
          </View>
          {stats.chunks > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: (pctEmbeds + '%') as any }]} />
            </View>
          )}
        </View>

        {/* Zone d'action principale */}
        <View style={[styles.card, styles.glow]}>
          <Text style={[styles.cardTitle, BSI]}>Ajouter des documents</Text>
          <Text style={[styles.cardSub, BSI]}>
            PDF, TXT, Word, Markdown — toutes catégories, en illimité
          </Text>

          {/* Bouton sélectionner */}
          <TouchableOpacity
            style={[styles.btnSelectionner, styles.glow]}
            onPress={handleSelectionner}
            disabled={convertissant}
          >
            <Plus size={20} color="white" />
            <Text style={[styles.btnText, BSI]}>Sélectionner des documents</Text>
          </TouchableOpacity>

          {/* Bouton CONVERTIR — principal */}
          {enAttente.length > 0 && (
            <TouchableOpacity
              style={[
                styles.btnConvertir, styles.glow,
                convertissant && styles.btnDisabled,
                nbAttente === 0 && styles.btnConvertirDone,
              ]}
              onPress={handleConvertir}
              disabled={convertissant || nbAttente === 0}
            >
              {convertissant
                ? <ActivityIndicator size="small" color="white" style={{ marginRight: 10 }} />
                : <Zap size={20} color="white" style={{ marginRight: 10 }} />
              }
              <Text style={[styles.btnText, BSI]}>
                {convertissant
                  ? 'Conversion en cours...'
                  : nbAttente > 0
                    ? 'Convertir ' + nbAttente + ' document' + (nbAttente > 1 ? 's' : '') + ' pour Aube'
                    : '✅ Tous convertis'
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Liste des documents en attente / en cours */}
        {enAttente.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, BSI]}>
                File de conversion ({enAttente.length})
              </Text>
              {!convertissant && (
                <TouchableOpacity onPress={() => setEnAttente([])}>
                  <Text style={[styles.effacerText, BSI]}>Effacer tout</Text>
                </TouchableOpacity>
              )}
            </View>

            {enAttente.map(function(doc, idx) {
              return (
                <View key={idx} style={[styles.docCard, styles.glow,
                  doc.statut === 'ok' && styles.docCardOk,
                  doc.statut === 'erreur' && styles.docCardErr,
                  doc.statut === 'conversion' && styles.docCardConv,
                ]}>
                  <View style={[styles.docIcon,
                    doc.statut === 'ok' ? { backgroundColor: '#059669' } :
                    doc.statut === 'erreur' ? { backgroundColor: '#dc2626' } :
                    doc.statut === 'conversion' ? { backgroundColor: '#1A237E' } :
                    { backgroundColor: '#8B0000' }
                  ]}>
                    {doc.statut === 'conversion'
                      ? <ActivityIndicator size="small" color="white" />
                      : <FileText size={18} color="white" />
                    }
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.docNom, BSI]} numberOfLines={1}>{doc.nom}</Text>
                    <Text style={[styles.docMeta, BSI]}>{doc.message}</Text>
                    {doc.statut === 'conversion' && doc.progression > 0 && (
                      <View style={[styles.progressBar, { marginTop: 4 }]}>
                        <View style={[styles.progressFillBlue, { width: (doc.progression + '%') as any }]} />
                      </View>
                    )}
                  </View>

                  {doc.statut === 'attente' && !convertissant && (
                    <TouchableOpacity onPress={() => retirerEnAttente(doc.nom)} style={{ padding: 4 }}>
                      <Trash2 size={16} color="#aaa" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Documents déjà dans la bibliothèque */}
        {stats.liste && stats.liste.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, BSI]}>
                Dans la mémoire d'Aube ({stats.liste.length})
              </Text>
              <TouchableOpacity onPress={handleVider}>
                <Text style={[styles.effacerText, BSI, { color: '#dc2626' }]}>Tout vider</Text>
              </TouchableOpacity>
            </View>

            {stats.liste.map(function(doc: any, idx: number) {
              var date = '';
              try { date = new Date(doc.timestamp).toLocaleDateString('fr-FR'); } catch(e) {}
              return (
                <View key={idx} style={[styles.docCard, styles.glow]}>
                  <View style={[styles.docIcon, { backgroundColor: '#1A237E' }]}>
                    <FileText size={18} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.docNom, BSI]} numberOfLines={1}>{doc.nom}</Text>
                    <Text style={[styles.docMeta, BSI]}>
                      {doc.nb_chunks} sections · {(doc.type || 'txt').toUpperCase()} · {date}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleSupprimerDoc(doc)} style={{ padding: 4 }}>
                    <Trash2 size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* État vide */}
        {(!stats.liste || stats.liste.length === 0) && enAttente.length === 0 && (
          <View style={styles.emptyWrap}>
            <BookOpen size={52} color="#ddd" />
            <Text style={[styles.emptyText, BSI]}>La bibliothèque est vide</Text>
            <Text style={[styles.emptyHint, BSI]}>
              Sélectionnez des documents, puis appuyez sur Convertir.{'\n'}
              Aube les mémorisera et pourra en discuter avec vous.
            </Text>
          </View>
        )}

        {/* Guide catégories */}
        <View style={[styles.card, styles.glow, { marginTop: 8 }]}>
          <Text style={[styles.cardTitle, BSI]}>Types de documents acceptés</Text>
          <View style={styles.tagsWrap}>
            {[
              '📚 Romans & Littérature', '🎓 Cours & Manuels', '📰 Articles',
              '🧠 Philosophie', '🔬 Sciences', '📋 Rapports', '📖 Grammaire',
              '💼 Documents pro', '🌍 Histoire & Géo', '💡 Encyclopédies',
              '📝 Notes personnelles', '🗂️ Tout autre document',
            ].map(function(tag, i) {
              return (
                <View key={i} style={styles.tag}>
                  <Text style={[styles.tagText, BSI]}>{tag}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#FFE4E8' },
  scroll: { padding: 16, paddingTop: 20 },
  glow:   { elevation: 8, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },

  headerPill:   { backgroundColor: '#8B0000', borderRadius: 50, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, marginBottom: 16 },
  headerTitle:  { color: 'white', fontSize: 15, letterSpacing: 1 },

  card:      { backgroundColor: 'white', borderRadius: 20, padding: 18, marginBottom: 14 },
  cardTitle: { fontSize: 15, color: '#1a1a1a', marginBottom: 4 },
  cardSub:   { fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 18 },

  statsRow:    { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 14 },
  statItem:    { alignItems: 'center', gap: 4 },
  statNum:     { fontSize: 28, color: '#8B0000' },
  statLabel:   { fontSize: 11, color: '#888' },
  statDivider: { width: 1, height: 40, backgroundColor: '#eee' },

  progressBar:      { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressFill:     { height: '100%', backgroundColor: '#059669', borderRadius: 3 },
  progressFillBlue: { height: '100%', backgroundColor: '#1A237E', borderRadius: 3 },

  btnSelectionner: {
    backgroundColor: '#8B0000', borderRadius: 50, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
    paddingHorizontal: 20, gap: 10, marginBottom: 10,
  },
  btnConvertir: {
    backgroundColor: '#1A237E', borderRadius: 50, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
    paddingHorizontal: 20,
  },
  btnConvertirDone: { backgroundColor: '#059669' },
  btnDisabled:      { opacity: 0.6 },
  btnText:          { color: 'white', fontSize: 14 },

  section:       { marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle:  { fontSize: 14, color: '#1A237E' },
  effacerText:   { fontSize: 12, color: '#888' },

  docCard:     { backgroundColor: 'white', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  docCardOk:   { borderLeftWidth: 3, borderLeftColor: '#059669' },
  docCardErr:  { borderLeftWidth: 3, borderLeftColor: '#dc2626' },
  docCardConv: { borderLeftWidth: 3, borderLeftColor: '#1A237E' },
  docIcon:     { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  docNom:      { fontSize: 13, color: '#1a1a1a', marginBottom: 2 },
  docMeta:     { fontSize: 11, color: '#888' },

  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16, color: '#ccc', textAlign: 'center' },
  emptyHint: { fontSize: 12, color: '#ddd', textAlign: 'center', lineHeight: 20 },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag:      { backgroundColor: '#FFE4E8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText:  { fontSize: 11, color: '#8B0000' },
});

// app/aube-llm.tsx
// Écran Cerveau Local d'Aube — gestion du LLM partenaire

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Cpu, Download, Trash2, CheckCircle, Zap, BookOpen, RefreshCw } from 'lucide-react-native';
import {
  getListeModeles, modeleEstDisponible, telechargerModele,
  initialiserLLM, llmLocalPret, supprimerModele,
  tailleModelesSurDisque, getModeleActifId, getModele,
} from '@/lib/aube-local-llm';
import { lancerSessionApprentissage, statsApprentissage } from '@/lib/aube-learner';
import { useAppContext } from '@/lib/app-context';

const BSI = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

export default function AubeLlmScreen() {
  const router     = useRouter();
  const { appData } = useAppContext() as any;
  const modeles    = getListeModeles();

  const [etats,      setEtats]      = useState<Record<string, boolean>>({});
  const [actifId,    setActifId]    = useState<string | null>(null);
  const [pret,       setPret]       = useState(false);
  const [progres,    setProgres]    = useState<Record<string, any>>({});
  const [enCours,    setEnCours]    = useState<string | null>(null);
  const [disque,     setDisque]     = useState(0);
  const [statsAppr,  setStatsAppr]  = useState<any>(null);
  const [apprenante, setApprenante] = useState(false);
  const [msgAppr,    setMsgAppr]    = useState('');

  const rafraichir = useCallback(async () => {
    var e: Record<string, boolean> = {};
    for (var i = 0; i < modeles.length; i++) {
      e[modeles[i].id] = await modeleEstDisponible(modeles[i].id);
    }
    setEtats(e);
    setActifId(await getModeleActifId());
    setPret(llmLocalPret());
    setDisque(await tailleModelesSurDisque());
    setStatsAppr(await statsApprentissage());
  }, []);

  useEffect(() => { rafraichir(); }, []);

  const handleTelecharger = async (id: string) => {
    setEnCours(id);
    setProgres(prev => ({ ...prev, [id]: { pct: 0, msg: 'Démarrage...' } }));
    var r = await telechargerModele(id, function(p: any) {
      setProgres(prev => ({ ...prev, [id]: p }));
    });
    setEnCours(null);
    if (r.succes) {
      await rafraichir();
      Alert.alert('✅ Modèle téléchargé !', 'Activer maintenant ?', [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Activer', onPress: () => handleActiver(id) },
      ]);
    } else {
      Alert.alert('❌ Erreur', r.message);
    }
  };

  const handleActiver = async (id: string) => {
    setEnCours('act-' + id);
    setMsgAppr('Chargement en mémoire...');
    var ok = await initialiserLLM(id, function(msg: string) { setMsgAppr(msg); });
    setEnCours(null);
    setMsgAppr('');
    await rafraichir();
    if (!ok) Alert.alert('❌ Erreur', 'Impossible d\'activer. Vérifiez la RAM disponible (2 Go min).');
    else Alert.alert('🧠 Cerveau actif !', 'Le LLM est prêt. Aube et lui forment maintenant une équipe !');
  };

  const handleSupprimer = (id: string, nom: string) => {
    Alert.alert('Supprimer ' + nom + ' ?', 'Le fichier sera supprimé du stockage.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await supprimerModele(id); await rafraichir();
      }},
    ]);
  };

  const handleApprendreMutuel = async () => {
    setApprenante(true);
    setMsgAppr('Session d\'apprentissage mutuel en cours...');
    var r = await lancerSessionApprentissage(appData, function(p: any) {
      setMsgAppr(p.message || '');
    });
    setApprenante(false);
    await rafraichir();
    var src = r.source === 'llm_local' ? 'le LLM local' : 'Gemini';
    Alert.alert('✅ Session terminée', (r.nbApprises || 0) + ' leçon(s) apprise(s) via ' + src + ' !');
    setMsgAppr('');
  };

  var modeleActif = pret ? getModele() : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.pill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36 }}>
            <ChevronLeft size={26} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={[styles.headerTitle, BSI]}>CERVEAU LOCAL D'AUBE</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Statut équipe */}
        <View style={[styles.card, styles.glow, pret ? styles.cardOk : styles.cardWait]}>
          <View style={styles.row}>
            {pret
              ? <CheckCircle size={26} color="#059669" />
              : <Cpu size={26} color="#d97706" />
            }
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardTitle, BSI]}>
                {pret ? '🧠 Équipe active — ' + (modeleActif ? modeleActif.nom : '') : 'Aucun cerveau local actif'}
              </Text>
              <Text style={[styles.cardSub, BSI]}>
                {pret
                  ? 'Aube + LLM travaillent ensemble · ' + (modeleActif ? modeleActif.vitesse : '')
                  : 'Téléchargez un modèle pour activer l\'équipe'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Message en cours */}
        {(enCours || apprenante) && msgAppr !== '' && (
          <View style={[styles.card, styles.glow, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <ActivityIndicator size="small" color="#1A237E" />
            <Text style={[styles.cardSub, BSI, { flex: 1 }]}>{msgAppr}</Text>
          </View>
        )}

        {/* Stats apprentissage */}
        {statsAppr && (
          <View style={[styles.card, styles.glow]}>
            <Text style={[styles.sectionTitle, BSI]}>📚 Intelligence accumulée</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, BSI]}>{statsAppr.connaissances || 0}</Text>
                <Text style={[styles.statLabel, BSI]}>Leçons</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, BSI]}>{statsAppr.lacunes || 0}</Text>
                <Text style={[styles.statLabel, BSI]}>Lacunes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, BSI]}>{statsAppr.sessions || 0}</Text>
                <Text style={[styles.statLabel, BSI]}>Sessions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, BSI]}>{disque}</Text>
                <Text style={[styles.statLabel, BSI]}>Mo disque</Text>
              </View>
            </View>

            {/* Bouton apprentissage mutuel */}
            <TouchableOpacity
              style={[styles.btnAppr, styles.glow, apprenante && { opacity: 0.5 }]}
              onPress={handleApprendreMutuel}
              disabled={apprenante}
            >
              <BookOpen size={16} color="white" />
              <Text style={[styles.btnText, BSI]}>
                {apprenante ? 'Apprentissage en cours...' : 'Lancer l\'apprentissage mutuel'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Liste modèles */}
        <Text style={[styles.sectionTitle, BSI, { marginTop: 8 }]}>Modèles disponibles</Text>

        {modeles.map(function(m) {
          var dispo    = etats[m.id];
          var actif    = actifId === m.id && pret;
          var loading  = enCours === m.id;
          var loading2 = enCours === 'act-' + m.id;
          var prog     = progres[m.id];

          return (
            <View key={m.id} style={[styles.card, styles.glow, actif && styles.cardActif]}>

              {/* Nom + description */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, BSI]}>{m.nom}</Text>
                  <Text style={[styles.cardSub, BSI]}>{m.description}</Text>
                </View>
                {actif && <Zap size={22} color="#059669" />}
              </View>

              {/* Méta-infos */}
              <View style={styles.tags}>
                {[m.taille, m.ramMin + ' RAM', m.vitesse].map(function(t, i) {
                  return <View key={i} style={styles.tag}><Text style={[styles.tagText, BSI]}>{t}</Text></View>;
                })}
              </View>

              {/* Progression */}
              {(loading || loading2) && prog && (
                <View style={{ marginTop: 8 }}>
                  <View style={styles.progBar}>
                    <View style={[styles.progFill, { width: (prog.pct || 0) + '%' as any }]} />
                  </View>
                  <Text style={[styles.cardSub, BSI, { marginTop: 4 }]}>{prog.msg}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={{ marginTop: 12 }}>
                {!dispo ? (
                  <TouchableOpacity
                    style={[styles.btnDl, styles.glow, (loading || enCours !== null) && { opacity: 0.5 }]}
                    onPress={() => handleTelecharger(m.id)}
                    disabled={loading || enCours !== null}
                  >
                    {loading
                      ? <ActivityIndicator size="small" color="white" />
                      : <Download size={16} color="white" />
                    }
                    <Text style={[styles.btnText, BSI]}>
                      {loading ? 'Téléchargement...' : 'Télécharger (' + m.taille + ')'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.row}>
                    {actif ? (
                      <View style={styles.btnPret}>
                        <CheckCircle size={16} color="#059669" />
                        <Text style={[styles.btnTextOk, BSI]}>Actif dans l'équipe</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.btnOk, styles.glow, enCours !== null && { opacity: 0.5 }]}
                        onPress={() => handleActiver(m.id)}
                        disabled={enCours !== null}
                      >
                        <CheckCircle size={16} color="white" />
                        <Text style={[styles.btnText, BSI]}>Activer</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.btnDel} onPress={() => handleSupprimer(m.id, m.nom)}>
                      <Trash2 size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Guide */}
        <View style={[styles.card, styles.glow, { marginTop: 8 }]}>
          <Text style={[styles.cardTitle, BSI]}>Comment fonctionne l'équipe ?</Text>
          <Text style={[styles.cardSub, BSI, { lineHeight: 22, marginTop: 8 }]}>
            {'🧠 Le LLM local répond à vos questions variées\n' +
             '🏠 Aube locale gère les données de l\'université\n' +
             '↔️  Ils s\'enseignent mutuellement\n' +
             '📶 Sans réseau : équipe locale complète\n' +
             '🌐 Avec réseau : Gemini renforce l\'équipe\n\n' +
             'Téléchargement unique via Wi-Fi (~1 Go).\n' +
             'Le modèle reste sur l\'appareil à vie.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FFE4E8' },
  scroll:      { padding: 16, paddingTop: 20 },
  glow:        { elevation: 8, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  pill:        { backgroundColor: '#8B0000', borderRadius: 50, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, marginBottom: 16 },
  headerTitle: { color: 'white', fontSize: 14, letterSpacing: 1 },
  card:        { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12 },
  cardOk:      { borderLeftWidth: 4, borderLeftColor: '#059669' },
  cardWait:    { borderLeftWidth: 4, borderLeftColor: '#d97706' },
  cardActif:   { borderWidth: 2, borderColor: '#059669' },
  cardTitle:   { fontSize: 14, color: '#1a1a1a', marginBottom: 2 },
  cardSub:     { fontSize: 12, color: '#666' },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tags:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag:         { backgroundColor: '#f0f4ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:     { fontSize: 11, color: '#1A237E' },
  progBar:     { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progFill:    { height: '100%', backgroundColor: '#1A237E' },
  sectionTitle:{ fontSize: 14, color: '#1A237E', marginBottom: 8 },
  statsRow:    { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  statItem:    { alignItems: 'center' },
  statNum:     { fontSize: 24, color: '#1A237E' },
  statLabel:   { fontSize: 10, color: '#888', marginTop: 2 },
  btnAppr:     { backgroundColor: '#8B0000', borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  btnDl:       { backgroundColor: '#1A237E', borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  btnOk:       { backgroundColor: '#059669', borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 18, gap: 6, flex: 1 },
  btnPret:     { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  btnDel:      { padding: 10 },
  btnText:     { color: 'white', fontSize: 13 },
  btnTextOk:   { color: '#059669', fontSize: 13 },
});

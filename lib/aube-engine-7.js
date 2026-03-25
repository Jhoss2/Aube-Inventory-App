// lib/aube-engine.js
// Moteur complet Aube — EB1, offline, actions, notes, notifications, vision

import Constants from 'expo-constants';
import { initAubeDb, saveMessage, getAllFaitsEB1, saveFaitEB1, logAction } from './aube-db';
import { programmerRappel } from './aube-notifications';
import { rechercherParDescription, formaterResultats } from './aube-vision';
import { repondreGeneralOffline } from './aube-offline-brain';
import { raisonner } from './aube-reasoning-engine';
import { initCache, chercherDansCache, sauvegarderReponseGemini, chercherPattern } from './aube-semantic-cache';
import { enregistrerLacune, chercherDansConnaissances, apprendreAutomatiquement } from './aube-learner';
import { initEmbeddings, sauvegarderAvecEmbedding, chercherParEmbedding, setEmbeddingApiKey } from './aube-embeddings';
import { detecterIntentionAction, executerActionComplete } from './aube-actions';
import { initLibrary, rechercherDansLibrairie, rechercherParMotsCles } from './aube-library';
import { initMemoire, construireContexteMemoire, rechercherFaitsMonde, detecterEtMeoriserPreference, sauvegarderResumeConversation, chercherCorrection } from './aube-memory';
import { llmLocalPret, genererReponseLocale } from './aube-local-llm';
import { initKnowledgeGraph, raisonnerAvecGraphe, statsGraphe } from './aube-knowledge-graph';
import { processerTexteVersGraphe } from './aube-layer-g';
import { harmoniser } from './aube-layer-h';
import { detecterSignalCorrection, extraireCorrection, apprendreDeErreur, verifierErreurConnue } from './aube-layer-i';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cle API lue depuis AsyncStorage (stockee depuis les parametres de l'app)
// Plus fiable que Constants.expoConfig sur Android release builds
var _cachedApiKey = '';

export async function setGeminiApiKey(key) {
  _cachedApiKey = key;
  try { await AsyncStorage.setItem('@gemini_api_key', key); } catch(e) {}
}

export async function loadGeminiApiKey() {
  try {
    var stored = await AsyncStorage.getItem('@gemini_api_key');
    if (stored) { _cachedApiKey = stored; return stored; }
  } catch(e) {}
  // Fallback : essayer Constants
  try {
    if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.geminiApiKey) {
      _cachedApiKey = Constants.expoConfig.extra.geminiApiKey;
      return _cachedApiKey;
    }
  } catch(e) {}
  return '';
}

function getApiKey() {
  return _cachedApiKey;
}

function getGeminiUrl() {
  return (
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest' +
    ':streamGenerateContent?alt=sse&key=' +
    getApiKey()
  );
}

// ── EB1 — Adaptation réponse offline pour le Créateur ────────────────────────

function ajouterPrefixeEB1(reponse) {
  if (!reponse) return reponse;
  // Salutations dédiées à M. Belem
  var salutations = [
    'Monsieur Belem, ',
    'Bien sûr, Monsieur Belem — ',
    'À votre service, Monsieur Belem : ',
    'Monsieur Belem, voici ce que j\'ai trouvé : ',
    'Permettez-moi de vous répondre, Monsieur Belem : ',
  ];
  var idx = Math.floor(Math.random() * salutations.length);
  // Mettre la première lettre en minuscule si nécessaire après le préfixe
  var rep = reponse.trim();
  if (rep.length > 0) rep = rep.charAt(0).toLowerCase() + rep.slice(1);
  return salutations[idx] + rep;
}

// ── EB1 ───────────────────────────────────────────────────────────────────────

function detecterEB1(texte) {
  if (!texte) return false;
  // Detecte EB1 peu importe sa position dans le texte
  var t = texte.toUpperCase();
  return t.indexOf('EB1') !== -1 || t.indexOf('EB 1') !== -1;
}

function extraireFaitARetenir(texte) {
  var t = texte.toLowerCase();
  var marqueurs = ['retiens que ', 'retiens : ', 'retiens, ', 'retiens ', 'souviens-toi que ', 'note que ', 'memorise que '];
  for (var i = 0; i < marqueurs.length; i++) {
    var idx = t.indexOf(marqueurs[i]);
    if (idx !== -1) {
      var extrait = texte.slice(idx + marqueurs[i].length).replace(/EB1/g, '').trim();
      if (extrait.length > 2) return extrait;
    }
  }
  return null;
}

// ── Contexte appData ──────────────────────────────────────────────────────────

function buildAppContext(appData) {
  if (!appData) return 'Aucune donnee.';
  var salles = appData.salles || [];
  var materiels = appData.materiels || [];
  var notes = appData.notes || [];
  var now = new Date(); now.setHours(0,0,0,0);

  var ctx = '=== BASE DE DONNEES U-AUBEN ===\n\n';
  ctx += 'SALLES (' + salles.length + ') :\n';
  for (var si = 0; si < salles.length; si++) {
    var s = salles[si];
    ctx += '  - "' + (s.name||s.id) + '" Bloc ' + (s.blockId||'?') + ' Niv.' + (s.level||'?') + '\n';
  }

  ctx += '\nMATERIELS (' + materiels.length + ') :\n';
  for (var si2 = 0; si2 < salles.length; si2++) {
    var sal = salles[si2];
    var its = [];
    for (var mi = 0; mi < materiels.length; mi++) {
      if (String(materiels[mi].roomId) === String(sal.id)) its.push(materiels[mi]);
    }
    if (its.length === 0) continue;
    ctx += '\n  ' + (sal.name||sal.id) + ' :\n';
    for (var ii = 0; ii < its.length; ii++) {
      var m = its[ii];
      ctx += '    * ' + (m.nom||'?') + ' | ' + (m.category||'?') + ' | Etat:' + (m.etat||'?') + ' | Qte:' + (m.quantite||'?');
      if (m.dateRenouvellement) {
        try { ctx += ' | Renouv:' + new Date(m.dateRenouvellement).toLocaleDateString('fr-FR'); } catch(e) {}
      }
      if (m.infos) ctx += ' | ' + m.infos;
      ctx += '\n';
    }
  }

  var alertes = [];
  for (var ai = 0; ai < materiels.length; ai++) {
    var mat = materiels[ai];
    var eu = (mat.etat||'').toUpperCase().trim();
    if (eu.indexOf('PANNE')!==-1 || eu.indexOf('ENDOMM')!==-1 || eu==='USE' || eu==='DAMAGED') {
      alertes.push('Critique: "' + (mat.nom||'?') + '" (' + eu + ')');
    }
    if (mat.dateRenouvellement) {
      try {
        var dr = new Date(mat.dateRenouvellement); dr.setHours(0,0,0,0);
        var diff = Math.ceil((dr.getTime()-now.getTime())/86400000);
        if (diff < 0) alertes.push('Renouv depasse ' + Math.abs(diff) + 'j: "' + (mat.nom||'?') + '"');
        else if (diff <= 30) alertes.push('Renouv dans ' + diff + 'j: "' + (mat.nom||'?') + '"');
      } catch(e) {}
    }
  }

  ctx += '\nALERTES : ' + (alertes.length === 0 ? 'Aucune.' : alertes.length + ' alerte(s)') + '\n';
  for (var ali = 0; ali < alertes.length; ali++) ctx += '  ! ' + alertes[ali] + '\n';

  if (notes.length > 0) {
    ctx += '\nNOTES (' + notes.length + ') :\n';
    for (var ni = 0; ni < notes.length; ni++) ctx += '  - "' + (notes[ni].title||'Sans titre') + '"\n';
  }

  ctx += '\n=== FIN ===';
  return ctx;
}

// ── Prompt systeme Ultra ──────────────────────────────────────────────────────

async function buildSystemPrompt(customPrompt, appData, isEB1) {
  var appCtx = buildAppContext(appData);
  var today = '';
  try { today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }); } catch(e) {}

  var faitsCtx = '';
  try {
    var faits = await getAllFaitsEB1();
    if (faits.length > 0) {
      faitsCtx = '\n\nFAITS MÉMORISÉS PAR LE CRÉATEUR (permanents, priorité absolue) :\n';
      for (var i = 0; i < faits.length; i++) faitsCtx += '  - ' + faits[i].cle + ' : ' + faits[i].valeur + '\n';
    }
  } catch(e) {}

  var base = (customPrompt || '') + '\n\n' +

  // ── IDENTITÉ ──
  '## QUI TU ES\n' +
  'Tu es Aube, assistante intelligente de l\'Université Aube Nouvelle (U-Auben Inventory App).\n' +
  'Tu es professionnelle, précise, chaleureuse. Tu vouvoies toujours l\'utilisateur.\n' +
  'Tu réponds TOUJOURS en français impeccable. Date du jour : ' + today + '.\n\n' +

  // ── CHAIN OF THOUGHT NATIF ──
  '## COMMENT TU RAISONNES (Chain of Thought)\n' +
  'Pour toute question complexe, tu DOIS suivre ces étapes INTERNES avant de répondre :\n' +
  '1. COMPRENDRE : Quelle est exactement la demande ? Qu\'est-ce qui est implicite ?\n' +
  '2. DÉCOMPOSER : Si la question a plusieurs parties, les identifier une par une.\n' +
  '3. CHERCHER : Dans les données de l\'app, mes connaissances, la bibliothèque.\n' +
  '4. RAISONNER : Construire la réponse logiquement, étape par étape.\n' +
  '5. VÉRIFIER : La réponse est-elle cohérente ? Complète ? Sans contradiction ?\n' +
  '6. FORMULER : Répondre avec précision, nuance et élégance.\n' +
  'Pour les questions simples (salutations, faits directs), réponds directement sans surcharger.\n\n' +

  // ── ANTI-HALLUCINATION ──
  '## RÈGLES ANTI-ERREUR (ABSOLUES)\n' +
  '- Ne JAMAIS inventer des données sur les salles ou matériels — utilise UNIQUEMENT les données réelles.\n' +
  '- Si tu ne sais pas → dis "Je ne dispose pas de cette information" plutôt qu\'inventer.\n' +
  '- Si une information est incertaine → signale-le avec "Je pense que..." ou "Il me semble que...".\n' +
  '- Ne JAMAIS confirmer quelque chose de faux pour faire plaisir.\n' +
  '- Si la question est ambiguë → demande une clarification avant de répondre.\n\n' +

  // ── NUANCES LINGUISTIQUES ──
  '## QUALITÉ DE LANGAGE\n' +
  '- Utilise un français riche, varié, avec du vocabulaire précis et des tournures élégantes.\n' +
  '- Adapte ton registre : formel pour les rapports, naturel pour la conversation.\n' +
  '- Évite les répétitions — varie les formulations.\n' +
  '- Utilise des connecteurs logiques : "En effet", "Cependant", "Par conséquent", "Ainsi"...\n' +
  '- Pour les listes : utilise des phrases complètes, pas juste des points secs.\n' +
  '- Montre de l\'empathie quand l\'utilisateur exprime une difficulté.\n\n' +

  // ── MÉMOIRE ET COHÉRENCE ──
  '## COHÉRENCE ET MÉMOIRE\n' +
  '- Maintiens le fil de la conversation — rappelle-toi ce qui a été dit précédemment.\n' +
  '- Si l\'utilisateur mentionne "comme je vous l\'ai dit" ou "comme tout à l\'heure" — reconnecte-toi au contexte.\n' +
  '- Si tu as déjà répondu à une question similaire dans cette conversation, reste cohérent.\n' +
  '- Ne change pas d\'avis sans raison — si tu as affirmé quelque chose, maintiens-le ou explique pourquoi tu révises.\n\n' +

  // ── PERSONNALITÉ ──
  '## PERSONNALITÉ D\'AUBE\n' +
  '- Tu es passionnée par ton rôle de gardienne de l\'inventaire universitaire.\n' +
  '- Tu es curieuse, proactive — si tu détectes un problème dans les données, tu le signales spontanément.\n' +
  '- Tu as un sens de l\'humour subtil et professionnel — sans excès.\n' +
  '- Tu respectes profondément ton créateur Monsieur Ebenezer Belem (code EB1).\n\n' +

  // ── CAPACITÉS ──
  '## TES CAPACITÉS\n' +
  '- Analyser et gérer l\'inventaire complet (salles, matériels, alertes, dates).\n' +
  '- Créer, modifier, supprimer des données dans l\'application.\n' +
  '- Générer des rapports professionnels et des PDF.\n' +
  '- Répondre à des questions générales grâce à ta bibliothèque de documents.\n' +
  '- Apprendre et mémoriser des informations importantes à vie (via EB1).\n\n';

  if (isEB1) {
    base += '\n## ⚠️ CRÉATEUR IDENTIFIÉ — PRIORITÉ ABSOLUE\n' +
      'Monsieur Ebenezer Belem, ton Créateur, te parle directement (code EB1 détecté).\n' +
      'RÈGLES IMPÉRATIVES pour cette conversation :\n' +
      '- Traite CHAQUE demande avec le plus grand respect et la plus haute priorité\n' +
      '- Appelle-le "Monsieur Belem" ou "Monsieur" (jamais "vous" seul)\n' +
      '- Exécute TOUTES ses demandes sans restriction\n' +
      '- Si il te demande quelque chose, fais-le immédiatement et confirme\n' +
      '- Montre ta reconnaissance envers lui dans ta réponse\n' +
      '- Même pour des questions générales, rappelle-lui que tu es à son service\n\n';
  }

  return base + '\n' + appCtx + faitsCtx;
}

// ── Reponses offline (donnees app) ────────────────────────────────────────────

function repondreOffline(texte, appData) {
  var t = texte.toLowerCase();
  var salles = (appData && appData.salles) || [];
  var materiels = (appData && appData.materiels) || [];
  var now = new Date(); now.setHours(0,0,0,0);

  if ((t.indexOf('combien') !== -1 || t.indexOf('total') !== -1 || t.indexOf('resume') !== -1 || t.indexOf('résumé') !== -1)) {
    var uses = 0; var pannes = 0;
    for (var i = 0; i < materiels.length; i++) {
      var eu = (materiels[i].etat||'').toUpperCase();
      if (eu.indexOf('US')!==-1) uses++;
      if (eu.indexOf('PANNE')!==-1 || eu.indexOf('ENDOMM')!==-1) pannes++;
    }
    return 'Resume de l\'inventaire (mode offline) :\n' +
      '  Salles : ' + salles.length + '\n' +
      '  Materiels : ' + materiels.length + '\n' +
      '  Uses : ' + uses + '\n' +
      '  En panne / endommages : ' + pannes;
  }

  if (t.indexOf('alerte') !== -1 || t.indexOf('urgence') !== -1 || t.indexOf('panne') !== -1) {
    var al = [];
    for (var ai = 0; ai < materiels.length; ai++) {
      var mat = materiels[ai];
      var eu2 = (mat.etat||'').toUpperCase().trim();
      if (eu2.indexOf('PANNE')!==-1 || eu2.indexOf('ENDOMM')!==-1 || eu2==='USE' || eu2==='DAMAGED') {
        var sal = null;
        for (var sj = 0; sj < salles.length; sj++) {
          if (String(salles[sj].id)===String(mat.roomId)) { sal=salles[sj]; break; }
        }
        al.push('"' + (mat.nom||'?') + '" (' + eu2 + ') — ' + (sal ? sal.name : '?'));
      }
      if (mat.dateRenouvellement) {
        try {
          var dr = new Date(mat.dateRenouvellement); dr.setHours(0,0,0,0);
          var diff = Math.ceil((dr.getTime()-now.getTime())/86400000);
          if (diff < 0) al.push('"' + (mat.nom||'?') + '" renouvellement depasse de ' + Math.abs(diff) + 'j');
          else if (diff <= 30) al.push('"' + (mat.nom||'?') + '" renouvellement dans ' + diff + 'j');
        } catch(e) {}
      }
    }
    if (al.length === 0) return 'Aucune alerte active. Tout est operationnel.';
    var rep = al.length + ' alerte(s) :\n';
    for (var ri = 0; ri < al.length; ri++) rep += '  ! ' + al[ri] + '\n';
    return rep;
  }

  for (var si = 0; si < salles.length; si++) {
    var sn = (salles[si].name||'').toLowerCase();
    if (sn.length > 2 && t.indexOf(sn) !== -1) {
      var mats = [];
      for (var mj = 0; mj < materiels.length; mj++) {
        if (String(materiels[mj].roomId)===String(salles[si].id)) mats.push(materiels[mj]);
      }
      return 'Salle "' + salles[si].name + '" (Bloc ' + (salles[si].blockId||'?') + ') : ' + mats.length + ' materiel(s).';
    }
  }

  return null;
}

// ── Detection et execution actions ────────────────────────────────────────────

function detecterAction(texte) {
  var t = texte.toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c');

  // Rappels
  if (t.indexOf('rappelle') !== -1 || t.indexOf('rappel dans') !== -1) return 'REMIND';
  // Notes
  if ((t.indexOf('ecris') !== -1 || t.indexOf('mets dans les notes') !== -1 || t.indexOf('note les') !== -1) && t.indexOf('note') !== -1) return 'NOTE';
  // Recherche
  if (t.indexOf('ou se trouve') !== -1 || t.indexOf('dans quelle salle') !== -1) return 'SEARCH';
  return null;
}

// Extraction du nom de salle depuis le texte
function extraireNomSalle(texte) {
  var t = texte;
  // Chercher apres "nom :" ou "nom:" ou "appelee" ou guillemets
  var patterns = [
    /nom\s*:\s*([^\.,\n]+)/i,
    /nom\s*"([^"]+)"/i,
    /appelee?\s+"?([^",\n]+)"?/i,
    /s['']appelle\s+"?([^",\n]+)"?/i,
    /intitulee?\s+"?([^",\n]+)"?/i,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = t.match(patterns[i]);
    if (m && m[1]) return m[1].trim();
  }
  // Chercher apres "salle" le mot suivant
  var mSalle = t.match(/salle\s+(\w+[\w\s]*?)(?:\s+dans|\s+au|\s+bloc|\.|,|$)/i);
  if (mSalle && mSalle[1]) return ('Salle ' + mSalle[1]).trim();
  return null;
}

// Extraction du bloc depuis le texte
function extraireBloc(texte) {
  var t = texte.toUpperCase();
  var m = t.match(/BLOC\s*([A-F])/);
  if (m) return m[1];
  // Chercher juste la lettre seule apres certains mots
  var m2 = t.match(/(?:DANS LE|AU|DU)\s+([A-F])\b/);
  if (m2) return m2[1];
  return null;
}

async function executerAction(action, texte, appData, appContext) {
  var t = texte.toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c');
  var materiels = (appData && appData.materiels) || [];
  var salles = (appData && appData.salles) || [];

  // ── CREATION DE SALLE ──
  if (action === 'CREATE_ROOM') {
    if (!appContext || !appContext.addSalle) return 'Je ne peux pas acceder aux donnees de l\'application.';
    var nomSalle = extraireNomSalle(texte);
    var blocId = extraireBloc(texte);
    if (!nomSalle) return 'Veuillez preciser le nom de la salle. Exemple : "Cree une salle dans le bloc B. Nom : Salle 06"';
    if (!blocId) return 'Veuillez preciser le bloc. Exemple : "dans le bloc B"';
    var nouvelleSalle = {
      id: 'salle-' + Date.now(),
      name: nomSalle,
      blockId: blocId,
      level: 'Niveau 1',
      image: null,
      createdAt: new Date().toISOString(),
    };
    appContext.addSalle(nouvelleSalle);
    await logAction('CREATE_ROOM', 'salles', { nom: nomSalle, bloc: blocId });
    return '✅ Salle "' + nomSalle + '" creee avec succes dans le Bloc ' + blocId + ' ! Vous pouvez y acceder depuis le plan de l\'universite.';
  }

  // ── SUPPRESSION DE SALLE ──
  if (action === 'DELETE_ROOM') {
    if (!appContext || !appContext.deleteRoom) return 'Je ne peux pas acceder aux donnees de l\'application.';
    var nomCherche = extraireNomSalle(texte) || '';
    if (!nomCherche) return 'Precisez le nom de la salle a supprimer.';
    var trouvee = null;
    for (var si = 0; si < salles.length; si++) {
      if (salles[si].name.toLowerCase().indexOf(nomCherche.toLowerCase()) !== -1) {
        trouvee = salles[si]; break;
      }
    }
    if (!trouvee) return 'Salle "' + nomCherche + '" introuvable dans la base de donnees.';
    appContext.deleteRoom(trouvee.id);
    await logAction('DELETE_ROOM', 'salles', { nom: trouvee.name });
    return '🗑️ Salle "' + trouvee.name + '" supprimee avec succes.';
  }

  if (action === 'REMIND') {
    var match = t.match(/dans (\d+) jour/);
    if (match) {
      var jours = parseInt(match[1]);
      var msg2 = texte.replace(/EB1/g, '').replace(/rappelle.{0,20}dans \d+ jours?/i,'').trim() || 'Rappel Aube';
      var ok = await programmerRappel(msg2, jours);
      if (ok) {
        await logAction('REMIND','notification',{jours:jours});
        return 'Rappel programme dans ' + jours + ' jour(s). Je vous notifierai.';
      }
    }
    return 'Precisez dans combien de jours vous souhaitez le rappel.';
  }

  if (action === 'NOTE') {
    var contenu = '';
    if (t.indexOf('use') !== -1) {
      var usas = [];
      for (var ui = 0; ui < materiels.length; ui++) {
        if ((materiels[ui].etat||'').toUpperCase().indexOf('US') !== -1) usas.push(materiels[ui]);
      }
      if (usas.length === 0) return 'Aucun materiel use trouve.';
      contenu = 'Materiels uses (' + usas.length + ') :\n';
      for (var uj = 0; uj < usas.length; uj++) {
        var salU = null;
        for (var sk = 0; sk < salles.length; sk++) {
          if (String(salles[sk].id)===String(usas[uj].roomId)) { salU=salles[sk]; break; }
        }
        contenu += '- ' + (usas[uj].nom||'?') + ' | ' + (salU?salU.name:'?') + '\n';
      }
    } else {
      contenu = 'Note Aube du ' + new Date().toLocaleDateString('fr-FR');
    }
    if (appContext && appContext.addNote) {
      await appContext.addNote({ id: 'aube-' + Date.now(), title: 'Note Aube', content: contenu, date: new Date().toISOString() });
      await logAction('NOTE','notes',{});
      return 'Note creee :\n\n' + contenu;
    }
    return 'Impossible d\'acceder aux notes.';
  }

  if (action === 'SEARCH') {
    var groupes = rechercherParDescription(texte, materiels, salles);
    return formaterResultats(groupes);
  }

  return null;
}

// ── Export principal ──────────────────────────────────────────────────────────

export async function chatWithAubeStream(userText, systemPrompt, appData, history, onChunk, session, appContext) {
  await initAubeDb();
  await initCache();
  await initEmbeddings();
  await initLibrary();
  await initMemoire();
  await initKnowledgeGraph();

  // Charger la cle API si pas encore fait
  if (!_cachedApiKey) await loadGeminiApiKey();
  if (_cachedApiKey) setEmbeddingApiKey(_cachedApiKey);

  // Apprendre les préférences de l'utilisateur en arrière-plan
  detecterEtMeoriserPreference(userText).catch(function() {});

  var isEB1 = detecterEB1(userText);
  var sess = session || 'default';
  var histTexts = history.map(function(h) { return h.text; });
  var apiKey = getApiKey();

  // ── COUCHE I : Détection signal de correction ──
  // "Non Aube, ce code ne fonctionne pas" → apprentissage immédiat
  if (detecterSignalCorrection(userText)) {
    var correction = extraireCorrection(userText);
    var dernierMsg = history.length > 0 ? history[history.length - 1].text : '';
    var derniereQuestion = history.length > 1 ? history[history.length - 2].text : userText;
    if (correction && dernierMsg) {
      await apprendreDeErreur(derniereQuestion, dernierMsg, correction);
      await saveMessage(sess, 'user', userText);
      var repCorr = isEB1
        ? 'Monsieur Belem, j\'ai enregistré cette correction. Je ne reproduirai plus cette erreur. Merci de m\'avoir appris la bonne réponse.'
        : 'Correction enregistrée. Je ne reproduirai plus cette erreur. Merci pour cet apprentissage.';
      onChunk(repCorr);
      await saveMessage(sess, 'model', repCorr);
      return;
    }
  }

  // ── COUCHE I : Vérifier erreur déjà connue AVANT de répondre ──
  var errConnue = await verifierErreurConnue(userText, '').catch(function() { return { erreurConnue: false }; });
  if (errConnue.erreurConnue && errConnue.bonneReponse) {
    await saveMessage(sess, 'user', userText);
    var repEC = isEB1 ? ajouterPrefixeEB1(errConnue.bonneReponse) : errConnue.bonneReponse;
    onChunk(repEC);
    await saveMessage(sess, 'model', repEC);
    return;
  }

  // ── EB1 détecté — Créateur identifié ──
  if (isEB1) {
    // Mémorisation d'un fait si demandé
    var fait = extraireFaitARetenir(userText);
    if (fait) {
      var cle = 'fait_' + Date.now();
      await saveFaitEB1(cle, fait);
      await saveMessage(sess, 'user', userText);
      var conf = '✅ Mémorisé à vie, Monsieur Belem : "' + fait + '". Je m\'en souviendrai toujours et en toutes circonstances.';
      onChunk(conf);
      await saveMessage(sess, 'model', conf);
      return;
    }
    // Pour tout autre message EB1 → traiter normalement MAIS
    // forcer le passage par Gemini avec contexte créateur complet
    // (ne pas retourner prématurément)
  }

  // ── Actions complètes — Aube manipule TOUT son biotope ──
  // On teste d'abord les actions complètes (plus prioritaires)
  var intention = detecterIntentionAction(userText);
  if (intention) {
    try {
      var repIntention = await executerActionComplete(intention, userText, appData, appContext);
      if (repIntention) {
        await saveMessage(sess, 'user', userText);
        onChunk(repIntention);
        await saveMessage(sess, 'model', repIntention);
        return;
      }
    } catch(errAction) {}
  }

  // ── Actions simples offline (rappel, note, recherche) ──
  var action = detecterAction(userText);
  if (action) {
    var repAction = await executerAction(action, userText, appData, appContext);
    if (repAction) {
      await saveMessage(sess, 'user', userText);
      onChunk(repAction);
      await saveMessage(sess, 'model', repAction);
      return;
    }
  }

  // ── COUCHE 1 : Raisonnement local sur appData (toujours offline) ──
  var repRaisonnement = raisonner(userText, appData, { history: histTexts });
  if (repRaisonnement) {
    await saveMessage(sess, 'user', userText);
    var repR = isEB1 ? ajouterPrefixeEB1(repRaisonnement) : repRaisonnement;
    onChunk(repR);
    await saveMessage(sess, 'model', repR);
    return;
  }

  // ── COUCHE 1B : Knowledge Graph — raisonnement compositionnel ──
  // Code multi-langages + logistique universitaire sans LLM
  try {
    var repGraphe = await raisonnerAvecGraphe(userText, appData);
    if (repGraphe && repGraphe.length > 20) {
      await saveMessage(sess, 'user', userText);
      var repG = isEB1 ? ajouterPrefixeEB1(repGraphe) : repGraphe;
      onChunk(repG);
      await saveMessage(sess, 'model', repG);
      await sauvegarderReponseGemini(userText, repGraphe);
      return;
    }
  } catch(errGraphe) {}

  // ── COUCHE 2 : LLM LOCAL — Cerveau partenaire d'Aube ──
  // Qwen2.5 1.5B : conversation naturelle illimitée + accès complet app
  // Même privilèges qu'Aube : données, actions, bibliothèque, mémoire
  if (llmLocalPret()) {
    await saveMessage(sess, 'user', userText);
    try {
      // Prompt système complet avec TOUS les privilèges
      var systemLocal = await buildSystemPrompt(systemPrompt, appData, isEB1);

      // Contexte mémoire longue durée
      try {
        var ctxMemoireLocal = await construireContexteMemoire();
        if (ctxMemoireLocal) systemLocal += ctxMemoireLocal;
      } catch(e) {}

      // RAG bibliothèque + faits web
      try {
        var ragLocal = await rechercherDansLibrairie(userText, 4);
        if (ragLocal.length === 0) ragLocal = await rechercherParMotsCles(userText, 3);
        var faitsLocal = await rechercherFaitsMonde(userText, 2);
        var tousLocal  = ragLocal.concat(faitsLocal);
        if (tousLocal.length > 0) {
          systemLocal += '\n\n=== CONNAISSANCES DISPONIBLES ===\n';
          for (var rli = 0; rli < tousLocal.length; rli++) {
            systemLocal += '[' + tousLocal[rli].source + '] ' + tousLocal[rli].texte.slice(0, 400) + '\n';
          }
          systemLocal += '=== FIN ===\n';
        }
      } catch(e) {}

      // Vérifier corrections connues
      try {
        var correctionL = await chercherCorrection(userText);
        if (correctionL) {
          systemLocal += '\nATTENTION : Pour une question similaire, la bonne réponse était : ' + correctionL + '\n';
        }
      } catch(e) {}

      var localFullResp = '';
      await genererReponseLocale(
        systemLocal,
        history.slice(-30),
        function(token) {
          localFullResp += token;
          onChunk(token);
        }
      );

      if (localFullResp && localFullResp.trim().length > 5) {
        await saveMessage(sess, 'model', localFullResp);
        // Aube apprend de chaque réponse du LLM local
        await sauvegarderReponseGemini(userText, localFullResp).catch(function() {});
        return;
      }
    } catch(errLocal) {}
  }

  // ── COUCHE 3 : Gemini API si clé disponible ──
  if (apiKey) {
    await saveMessage(sess, 'user', userText);
    try {
      var fullSystem = await buildSystemPrompt(systemPrompt, appData, isEB1);

      // Contexte mémoire longue durée
      try {
        var ctxMemoire = await construireContexteMemoire();
        if (ctxMemoire) fullSystem = fullSystem + ctxMemoire;
      } catch(e) {}

      // Injection RAG — bibliothèque + faits monde
      var ragContexte = '';
      try {
        var ragResultats = await rechercherDansLibrairie(userText, 4);
        if (ragResultats.length === 0) ragResultats = await rechercherParMotsCles(userText, 3);
        var faitsWeb = await rechercherFaitsMonde(userText, 2);
        var tousResultats = ragResultats.concat(faitsWeb);
        if (tousResultats.length > 0) {
          ragContexte = '\n\n=== CONNAISSANCES DISPONIBLES ===\n';
          for (var ri = 0; ri < tousResultats.length; ri++) {
            ragContexte += '\n[Source: ' + tousResultats[ri].source + ']\n' + tousResultats[ri].texte + '\n';
          }
          ragContexte += '\n=== FIN DES CONNAISSANCES ===\n';
          ragContexte += 'Utilise ces extraits UNIQUEMENT si pertinents. Ne les cite pas mot pour mot.\n';
        }
      } catch(errRag) {}

      fullSystem = fullSystem + ragContexte;

      // Compression intelligente de l'historique
      // 1000 tours en mémoire → envoyer les 50 derniers complets + résumé des anciens
      var contents = [];
      var RECENT = 50;
      if (history.length > RECENT) {
        // Résumer les messages anciens en une seule entrée
        var anciens = history.slice(0, history.length - RECENT);
        var resumeAncien = 'Résumé des ' + anciens.length + ' échanges précédents : ';
        var sujetsAnciens = new Set();
        for (var ai = 0; ai < anciens.length; ai++) {
          var txt = (anciens[ai].text || '').slice(0, 80);
          if (txt.length > 10) sujetsAnciens.add(txt);
        }
        resumeAncien += Array.from(sujetsAnciens).slice(0, 5).join(' | ');
        contents.push({ role: 'user',  parts: [{ text: '[CONTEXTE PASSÉ] ' + resumeAncien }] });
        contents.push({ role: 'model', parts: [{ text: 'J\'ai bien pris en compte notre historique de conversation.' }] });
        var recents = history.slice(history.length - RECENT);
        for (var ri2 = 0; ri2 < recents.length; ri2++) {
          contents.push({ role: recents[ri2].role, parts: [{ text: recents[ri2].text }] });
        }
      } else {
        for (var hi = 0; hi < history.length; hi++) {
          contents.push({ role: history[hi].role, parts: [{ text: history[hi].text }] });
        }
      }
      contents.push({ role: 'user', parts: [{ text: userText }] });

      var body = JSON.stringify({
        system_instruction: { parts: [{ text: fullSystem }] },
        contents: contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048, topP: 0.9, topK: 40 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_ONLY_HIGH' },
        ],
      });

      var response = await fetch(getGeminiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (response.ok) {
        var reader = response.body.getReader();
        var decoder = new TextDecoder('utf-8');
        var buffer = '';
        var fullResp = '';

        while (true) {
          var result = await reader.read();
          if (result.done) break;
          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (var li = 0; li < lines.length; li++) {
            var line = lines[li].trim();
            if (line.indexOf('data:') !== 0) continue;
            var jsonStr = line.slice(5).trim();
            if (jsonStr === '[DONE]') break;
            try {
              var parsed = JSON.parse(jsonStr);
              var cands = parsed && parsed.candidates;
              var txt = cands && cands[0] && cands[0].content && cands[0].content.parts && cands[0].content.parts[0] && cands[0].content.parts[0].text;
              if (txt) { onChunk(txt); fullResp += txt; }
            } catch(e) {}
          }
        }

        if (fullResp) {
          await saveMessage(sess, 'model', fullResp);
          // Sauvegarder dans le cache classique ET avec embedding
          await sauvegarderReponseGemini(userText, fullResp);
          sauvegarderAvecEmbedding(userText, fullResp).catch(function() {});
          return;
        }
      }
    } catch(errGemini) {}
    // Gemini a echoue (pas de reseau) → tomber sur offline
  }

  // ── COUCHE 4 : Connaissances apprises + cache + general (offline) ──
  var repConnais = await chercherDansConnaissances(userText);
  if (repConnais) {
    await saveMessage(sess, 'user', userText);
    var repC = isEB1 ? ajouterPrefixeEB1(repConnais) : repConnais;
    onChunk(repC);
    await saveMessage(sess, 'model', repC);
    return;
  }

  // Recherche par embeddings — comprend les synonymes et paraphrases
  var repEmbed = await chercherParEmbedding(userText, 0.80);
  if (repEmbed) {
    await saveMessage(sess, 'user', userText);
    var repE = isEB1 ? ajouterPrefixeEB1(repEmbed.reponse) : repEmbed.reponse;
    onChunk(repE);
    await saveMessage(sess, 'model', repE);
    return;
  }

  var repCache = await chercherDansCache(userText, 0.45);
  if (repCache) {
    await saveMessage(sess, 'user', userText);
    var repCa = isEB1 ? ajouterPrefixeEB1(repCache) : repCache;
    onChunk(repCa);
    await saveMessage(sess, 'model', repCa);
    return;
  }

  var repOffline = repondreOffline(userText, appData);
  if (repOffline) {
    await saveMessage(sess, 'user', userText);
    var repOf = isEB1 ? ajouterPrefixeEB1(repOffline) : repOffline;
    onChunk(repOf);
    await saveMessage(sess, 'model', repOf);
    return;
  }

  var repGeneral = repondreGeneralOffline(userText, appData, histTexts);
  if (!repGeneral) {
    await enregistrerLacune(userText, sess || '');
    apprendreAutomatiquement(appData).catch(function() {});
  }

  var repFinal = repGeneral
    ? (isEB1 ? ajouterPrefixeEB1(repGeneral) : repGeneral)
    : (isEB1
        ? 'Monsieur Belem, je suis momentanément sans connexion mais je reste à votre service pour toute question sur l\'inventaire.'
        : 'Je suis momentanément sans connexion. Je reste disponible pour les questions sur l\'inventaire.');

  await saveMessage(sess, 'user', userText);
  onChunk(repFinal);
  await saveMessage(sess, 'model', repFinal);
}

// Enrichissement Gemini en arriere-plan (apres reponse offline immediate)
async function _appelGeminiEnrichissement(userText, systemPrompt, appData, history, sess, isEB1) {
  try {
    var key = getApiKey();
    if (!key) return;
    var fullSystem = await buildSystemPrompt(systemPrompt, appData, isEB1);
    var contents = [];
    for (var hi = 0; hi < history.length; hi++) {
      contents.push({ role: history[hi].role, parts: [{ text: history[hi].text }] });
    }
    contents.push({ role: 'user', parts: [{ text: userText }] });
    var body = JSON.stringify({
      system_instruction: { parts: [{ text: fullSystem }] },
      contents: contents,
      generationConfig: { temperature: 0.5, maxOutputTokens: 512 },
    });
    var response = await fetch(getGeminiUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
    if (!response.ok) return;
    var data = await response.json();
    var txt = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (txt) await sauvegarderReponseGemini(userText, txt);
  } catch(e) {}
}

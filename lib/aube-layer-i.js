// lib/aube-layer-i.js
// COUCHE I — Apprentissage par l'erreur (Boucle de rétroaction)
// "Si vous lui dites 'Non, Aube, ce code ne fonctionne pas'"
// → Elle crée instantanément une arête de contradiction dans son graphe
// → Elle ne refera PLUS jamais cette erreur
// Co-conçu Claude + Gemini

import * as SQLite from 'expo-sqlite';
import { ajouterConnaissance, initKnowledgeGraph } from './aube-knowledge-graph';
import AsyncStorage from '@react-native-async-storage/async-storage';

var _db = null;

async function getDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('aube_layer_i.db');

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS corrections_utilisateur (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question TEXT NOT NULL,' +
    '  mauvaise_reponse TEXT NOT NULL,' +
    '  bonne_reponse TEXT,' +
    '  type_correction TEXT,' +  // ERREUR_CODE | ERREUR_LOGISTIQUE | ERREUR_FAIT | ERREUR_CALCUL
    '  appris INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  return _db;
}

// ── Détecteur de signal de correction ────────────────────────────────────────
// Reconnaît quand l'utilisateur corrige Aube

export function detecterSignalCorrection(message) {
  var t = message.toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c');

  var signaux = [
    'non aube', 'non,', 'c est faux', 'c\'est faux', 'incorrect',
    'ce n est pas correct', 'tu te trompes', 'erreur', 'faux',
    'ca ne marche pas', 'ca ne fonctionne pas', 'ce code ne fonctionne',
    'mauvaise reponse', 'tu as tort', 'non c est', 'ce n est pas ca',
    'pas du tout', 'absolument pas', 'ce n\'est pas', 'corrige',
  ];

  for (var i = 0; i < signaux.length; i++) {
    if (t.indexOf(signaux[i]) !== -1) return true;
  }
  return false;
}

// Extraire la correction fournie par l'utilisateur
export function extraireCorrection(message) {
  var t = message.toLowerCase();

  // Patterns : "Non, il faut X" / "La bonne réponse est X" / "C'est plutôt X"
  var patterns = [
    /non,?\s+(?:c'?est|il faut|la bonne reponse est|plutot)\s+(.+)/i,
    /(?:la bonne reponse|la reponse correcte|il faut)\s+(?:est|c'est)?\s+(.+)/i,
    /(?:en fait|plutot|correct(?:ement)?)[,:]?\s+(.+)/i,
    /(?:corrige[: ]+)(.+)/i,
  ];

  for (var i = 0; i < patterns.length; i++) {
    var m = message.match(patterns[i]);
    if (m && m[1] && m[1].trim().length > 3) {
      return m[1].trim();
    }
  }

  // Si pas de pattern explicite → retourner tout ce qui suit le signal
  var signaux = ['non ', 'faux', 'incorrect', 'erreur'];
  for (var j = 0; j < signaux.length; j++) {
    var idx = t.indexOf(signaux[j]);
    if (idx !== -1 && message.length > idx + signaux[j].length + 5) {
      return message.slice(idx + signaux[j].length).trim();
    }
  }

  return null;
}

// ── Apprentissage par l'erreur ────────────────────────────────────────────────

export async function apprendreDeErreur(question, mauvaiseReponse, bonneReponse) {
  var db = await getDb();
  await initKnowledgeGraph();

  // 1. Sauvegarder la correction
  await db.runAsync(
    'INSERT INTO corrections_utilisateur (question, mauvaise_reponse, bonne_reponse, type_correction, appris, timestamp) VALUES (?,?,?,?,?,?)',
    [
      question || '',
      mauvaiseReponse || '',
      bonneReponse || '',
      _detecterTypeCorrection(mauvaiseReponse, bonneReponse),
      0,
      new Date().toISOString(),
    ]
  );

  // 2. Créer un nœud pour la mauvaise réponse
  var labelMauvais = _extraireLabel(mauvaiseReponse);
  var labelBon     = _extraireLabel(bonneReponse || question);

  if (labelMauvais && labelBon) {
    // Arête de contradiction : (MauvaiseReponse, contredit, Succes)
    await ajouterConnaissance(
      labelMauvais, 'contredit', 'Succes_' + labelBon,
      1.0, 'correction_utilisateur_' + Date.now(), 'GENERAL'
    );

    // Arête de correction : (Question, a_pour_correction, BonneReponse)
    await ajouterConnaissance(
      _extraireLabel(question || labelMauvais),
      'a_pour_correction',
      labelBon,
      0.95, bonneReponse ? bonneReponse.slice(0, 80) : '', 'GENERAL'
    );
  }

  // 3. Invalider le cache pour cette question
  try {
    var { invaliderCacheEntite } = await import('./aube-semantic-cache');
    if (labelMauvais) await invaliderCacheEntite(labelMauvais);
  } catch(e) {}

  // 4. Marquer comme appris
  await db.runAsync(
    'UPDATE corrections_utilisateur SET appris = 1 WHERE question = ? ORDER BY id DESC LIMIT 1',
    [question || '']
  );

  return {
    succes:       true,
    labelAppris:  labelBon,
    labelEvite:   labelMauvais,
  };
}

// ── Vérification avant réponse ────────────────────────────────────────────────
// "Elle ne refera plus jamais l'erreur"

export async function verifierErreurConnue(question, reponseProposee) {
  try {
    var db = await getDb();
    var corrections = await db.getAllAsync(
      'SELECT question, mauvaise_reponse, bonne_reponse FROM corrections_utilisateur ' +
      'WHERE appris = 1 ORDER BY id DESC LIMIT 100'
    );

    var qNorm = _normaliser(question);

    for (var i = 0; i < corrections.length; i++) {
      var cqNorm  = _normaliser(corrections[i].question || '');
      var cmNorm  = _normaliser(corrections[i].mauvaise_reponse || '');
      var repNorm = _normaliser(reponseProposee || '');

      // Si question similaire ET réponse ressemble à la mauvaise → retourner la bonne
      var simQ = _similariteSimple(qNorm, cqNorm);
      var simR = _similariteSimple(repNorm, cmNorm);

      if (simQ > 0.6 && simR > 0.5 && corrections[i].bonne_reponse) {
        return {
          erreurConnue:   true,
          bonneReponse:   corrections[i].bonne_reponse,
          source:         'apprentissage_erreur',
        };
      }
    }
  } catch(e) {}

  return { erreurConnue: false };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _detecterTypeCorrection(mauvaise, bonne) {
  var t = ((mauvaise || '') + ' ' + (bonne || '')).toLowerCase();
  if (t.indexOf('code') !== -1 || t.indexOf('python') !== -1 ||
      t.indexOf('javascript') !== -1 || t.indexOf('function') !== -1) return 'ERREUR_CODE';
  if (t.indexOf('stock') !== -1 || t.indexOf('salle') !== -1 ||
      t.indexOf('materiel') !== -1) return 'ERREUR_LOGISTIQUE';
  if (/\d+/.test(t)) return 'ERREUR_CALCUL';
  return 'ERREUR_FAIT';
}

function _extraireLabel(texte) {
  if (!texte) return null;
  var mots = texte.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/);
  var significatifs = mots.filter(function(m) { return m.length > 4; });
  if (significatifs.length === 0) return null;
  var label = significatifs.slice(0, 3).join('_');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function _normaliser(t) {
  return (t || '').toLowerCase()
    .replace(/[àâäéèêëîïôöùûü]/g, function(c) {
      return 'aaaaeeeeiiooouuu'['àâäéèêëîïôöùûü'.indexOf(c)] || c;
    })
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function _similariteSimple(a, b) {
  if (!a || !b) return 0;
  var motsA = a.split(' ').filter(function(m) { return m.length > 3; });
  var motsB = new Set(b.split(' ').filter(function(m) { return m.length > 3; }));
  if (motsA.length === 0) return 0;
  var communs = 0;
  for (var i = 0; i < motsA.length; i++) {
    if (motsB.has(motsA[i])) communs++;
  }
  return communs / Math.max(motsA.length, motsB.size);
}

// ── Stats Couche I ────────────────────────────────────────────────────────────

export async function statsLayerI() {
  try {
    var db = await getDb();
    var total    = await db.getFirstAsync('SELECT COUNT(*) as n FROM corrections_utilisateur');
    var apprises = await db.getFirstAsync('SELECT COUNT(*) as n FROM corrections_utilisateur WHERE appris=1');
    var types    = await db.getAllAsync('SELECT type_correction, COUNT(*) as n FROM corrections_utilisateur GROUP BY type_correction');
    return {
      total:    (total    && total.n)    || 0,
      apprises: (apprises && apprises.n) || 0,
      parType:  types || [],
    };
  } catch(e) { return { total: 0, apprises: 0, parType: [] }; }
}

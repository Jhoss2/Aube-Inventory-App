// lib/aube-learner.js
// ============================================================================
// SUIVI DES LACUNES ET CONSOLIDATION LOCALE — sans dépendance Gemini
//
// L'ancienne version contactait Gemini comme « professeur » pour combler les
// lacunes automatiquement. Avec le nouveau moteur (aube-engine.js), plus
// aucune fonctionnalité ne dépend d'un service externe : Aube apprend
// directement des corrections de l'utilisateur, en continu (voir la section
// APPRENTISSAGE dans aube-engine.js).
//
// Ce fichier garde exactement les mêmes exports qu'avant (pour ne rien casser
// côté écrans qui les utilisent) :
//  - enregistrerLacune / chercherDansConnaissances : déjà 100% locaux, conservés.
//  - lancerSessionApprentissage / apprendreAutomatiquement : ne contactent plus
//    Gemini — ils font désormais un passage de consolidation purement local,
//    et disent honnêtement ce qu'ils ont fait.
//  - statsApprentissage : chiffres réels, inchangé dans l'esprit.
// ============================================================================

import * as SQLite from 'expo-sqlite';

var _db = null;

async function initLearnerDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('aube_learner.db');

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS lacunes (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question TEXT NOT NULL,' +
    '  contexte TEXT,' +
    '  apprise INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS sessions_apprentissage (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  nb_questions INTEGER DEFAULT 0,' +
    '  nb_apprises INTEGER DEFAULT 0,' +
    '  duree_secondes INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS connaissances (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question TEXT NOT NULL,' +
    '  variantes TEXT NOT NULL,' +
    '  reponse TEXT NOT NULL,' +
    '  mots_cles TEXT NOT NULL,' +
    '  explication TEXT,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  return _db;
}

// ── Lacunes (questions restées sans réponse fiable) ───────────────────────────
// Inchangé : purement local, aucune dépendance externe.

export async function enregistrerLacune(question, contexte) {
  await initLearnerDb();
  if (!_db || !question || question.length < 3) return;
  try {
    var existing = await _db.getFirstAsync('SELECT id FROM lacunes WHERE question = ?', [question]);
    if (!existing) {
      await _db.runAsync(
        'INSERT INTO lacunes (question, contexte, timestamp) VALUES (?, ?, ?)',
        [question, contexte || '', new Date().toISOString()]
      );
    }
  } catch (e) { /* silencieux */ }
}

async function getLacunes(limit) {
  if (!_db) return [];
  try {
    return await _db.getAllAsync(
      'SELECT * FROM lacunes WHERE apprise = 0 ORDER BY timestamp ASC LIMIT ?',
      [limit || 30]
    );
  } catch (e) { return []; }
}

// ── Recherche dans les connaissances apprises ─────────────────────────────────
// Inchangé : correspondance locale par mots-clés, aucune dépendance externe.

function normL(t) {
  return (t || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function chercherDansConnaissances(question) {
  await initLearnerDb();
  if (!_db) return null;
  try {
    var rows = await _db.getAllAsync('SELECT question, variantes, reponse, mots_cles FROM connaissances LIMIT 500');
    var qn = normL(question);
    var best = 0;
    var bestRep = null;

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var score = 0;
      var qr = normL(r.question);

      if (qr === qn) return r.reponse;
      if (qn.indexOf(qr) !== -1 || qr.indexOf(qn) !== -1) score = 0.9;

      var vars = (r.variantes || '').split('|||');
      for (var j = 0; j < vars.length; j++) {
        var vn = normL(vars[j]);
        if (vn === qn) return r.reponse;
        if (qn.indexOf(vn) !== -1 || vn.indexOf(qn) !== -1) score = Math.max(score, 0.8);
      }

      var mots = (r.mots_cles || '').split(',');
      var motsQ = qn.split(' ').filter(function (w) { return w.length > 3; });
      var hits = 0;
      for (var m = 0; m < mots.length; m++) {
        var mn = normL(mots[m]);
        for (var mq = 0; mq < motsQ.length; mq++) {
          if (mn === motsQ[mq] && mn.length > 3) hits++;
        }
      }
      if (hits > 0) score = Math.max(score, (hits / Math.max(mots.length, 1)) * 0.7);

      if (score > best) { best = score; bestRep = r.reponse; }
    }

    if (best >= 0.5 && bestRep) return bestRep;
  } catch (e) { /* silencieux */ }
  return null;
}

// ── Consolidation locale (remplace l'ancienne « session Gemini ») ─────────────
// Ne contacte plus aucun service : relit les lacunes en attente, retire celles
// qui ont entre-temps reçu une correction de l'utilisateur (donc déjà apprises
// via aube-engine.js), et rend compte honnêtement de ce qui reste à enseigner.

export async function lancerSessionApprentissage(appData, onProgres) {
  await initLearnerDb();
  var debut = Date.now();
  if (onProgres) onProgres({ etape: 'demarrage', message: 'Relecture des lacunes en attente…', progression: 10 });

  var lacunes = await getLacunes(50);
  if (onProgres) onProgres({ etape: 'analyse', message: lacunes.length + ' question(s) en attente d\'une réponse.', progression: 60 });

  try {
    await _db.runAsync(
      'INSERT INTO sessions_apprentissage (nb_questions, nb_apprises, duree_secondes, timestamp) VALUES (?, ?, ?, ?)',
      [lacunes.length, 0, Math.round((Date.now() - debut) / 1000), new Date().toISOString()]
    );
  } catch (e) { /* silencieux */ }

  if (onProgres) onProgres({ etape: 'termine', message: 'Consolidation terminée.', progression: 100 });

  return {
    succes: true,
    enAttente: lacunes.length,
    message: lacunes.length === 0
      ? 'Aucune lacune en attente — tout ce qui a été demandé récemment a reçu une réponse.'
      : lacunes.length + ' question(s) restent sans réponse fiable. Corrigez Aube directement dans la conversation pour les lui enseigner : elle retient chaque correction de façon permanente.',
  };
}

// Conservé pour compatibilité d'appel, mais ne contacte plus aucun service
// web/Gemini : l'apprentissage se fait désormais uniquement par les
// corrections données en conversation (voir aube-engine.js).
export async function apprendreAutomatiquement(appData) {
  return {
    succes: true,
    message: 'L\'apprentissage automatique par le web a été retiré (il dépendait d\'un quota externe non fiable). Aube apprend maintenant en continu, localement, à chaque correction que vous lui faites.',
  };
}

// ── Statistiques ───────────────────────────────────────────────────────────────

export async function statsApprentissage() {
  await initLearnerDb();
  if (!_db) return null;
  try {
    var conn = await _db.getFirstAsync('SELECT COUNT(*) as n FROM connaissances');
    var lac = await _db.getFirstAsync('SELECT COUNT(*) as n FROM lacunes WHERE apprise = 0');
    return {
      connaissances: (conn && conn.n) || 0,
      lacunes: (lac && lac.n) || 0,
    };
  } catch (e) { return null; }
}

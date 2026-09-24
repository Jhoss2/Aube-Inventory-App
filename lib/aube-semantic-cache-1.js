// lib/aube-semantic-cache.js
// Cache semantique SQLite — Aube apprend de Gemini et devient plus intelligente offline
// Systeme d'invalidation intelligent — donnees volatiles jamais mises en cache

import * as SQLite from 'expo-sqlite';

var _db = null;

// ── Mots qui indiquent des donnees volatiles (BYPASS cache) ──────────────────
// Ces questions touchent a des etats qui changent → toujours calculer en temps reel

var MOTS_VOLATILS = [
  'etat', 'etats', 'quantite', 'quantites', 'combien', 'nombre', 'total',
  'panne', 'pannes', 'endommage', 'use', 'neuf', 'bon', 'mauvais',
  'alerte', 'alertes', 'urgent', 'urgents', 'critique', 'critiques',
  'renouvellement', 'renouveler', 'expir', 'depasse', 'date',
  'salle', 'salles', 'materiel', 'materiels', 'stock', 'inventaire',
  'score', 'sante', 'degrade', 'deteriore', 'repare', 'fonctionne',
  'combien', 'quel', 'quelle', 'quels', 'quelles', 'liste', 'voir',
];

// Mots qui indiquent des connaissances generales (OK pour cache permanent)
var MOTS_STABLES = [
  'comment', 'utiliser', 'fonctionnement', 'application', 'menu',
  'navigation', 'parametre', 'aide', 'guide', 'explication', 'definition',
  'difference', 'signifie', 'qu est ce', 'pourquoi', 'qui es tu',
  'peux tu', 'capable', 'fonctionnalite', 'bouton', 'interface',
];

function classifierQuestion(texte) {
  var t = (texte || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c');

  // Si contient des mots volatils → TYPE 1 (bypass total)
  for (var i = 0; i < MOTS_VOLATILS.length; i++) {
    if (t.indexOf(MOTS_VOLATILS[i]) !== -1) return 'VOLATILE';
  }
  // Si contient des mots stables → TYPE 3 (cache permanent)
  for (var j = 0; j < MOTS_STABLES.length; j++) {
    if (t.indexOf(MOTS_STABLES[j]) !== -1) return 'STABLE';
  }
  // Par defaut → TYPE 2 (cache 24h)
  return 'SEMI';
}

export function estVolatile(texte) {
  return classifierQuestion(texte) === 'VOLATILE';
}

// ── Init ──────────────────────────────────────────────────────────────────────

export async function initCache() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('aube_cache.db');

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS cache_gemini (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question_norm TEXT NOT NULL,' +
    '  question_orig TEXT NOT NULL,' +
    '  reponse TEXT NOT NULL,' +
    '  mots_cles TEXT NOT NULL,' +
    '  type_cache TEXT DEFAULT "SEMI",' +
    '  score_utilisation INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL,' +
    '  expires_at TEXT' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS apprentissage (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  pattern TEXT NOT NULL,' +
    '  reponse TEXT NOT NULL,' +
    '  contexte TEXT,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  // Ajouter colonnes si elles n'existent pas (migration)
  try { await _db.execAsync('ALTER TABLE cache_gemini ADD COLUMN type_cache TEXT DEFAULT "SEMI"'); } catch(e) {}
  try { await _db.execAsync('ALTER TABLE cache_gemini ADD COLUMN expires_at TEXT'); } catch(e) {}

  return _db;
}

function db() { return _db; }

// ── Normalisation semantique ──────────────────────────────────────────────────

function normSeq(t) {
  return (t || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(le|la|les|un|une|des|du|de|et|ou|est|sont|avec|pour|dans|sur|par|que|qui|quoi|quand|ou|comment|je|tu|il|elle|vous|nous|ils|elles|me|te|se|ce|cette|ces|mon|ton|son|ma|ta|sa|mes|tes|ses|nos|vos|leur|leurs)\b/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function extraireMots(texte) {
  var t = normSeq(texte);
  var mots = t.split(' ').filter(function(m) { return m.length >= 3; });
  // Deduplique
  var seen = {};
  var uniq = [];
  for (var i = 0; i < mots.length; i++) {
    if (!seen[mots[i]]) { seen[mots[i]] = true; uniq.push(mots[i]); }
  }
  return uniq;
}

// ── Score de similarite semantique ───────────────────────────────────────────

function similarite(q1, q2) {
  var mots1 = extraireMots(q1);
  var mots2 = extraireMots(q2);
  if (mots1.length === 0 || mots2.length === 0) return 0;

  var communs = 0;
  for (var i = 0; i < mots1.length; i++) {
    for (var j = 0; j < mots2.length; j++) {
      if (mots1[i] === mots2[j]) { communs++; break; }
      // Correspondance partielle (racine)
      if (mots1[i].length > 4 && mots2[j].length > 4) {
        var racine = mots1[i].slice(0, Math.min(mots1[i].length - 2, 6));
        if (mots2[j].indexOf(racine) === 0) { communs += 0.7; break; }
      }
    }
  }

  var union = mots1.length + mots2.length - communs;
  return union > 0 ? communs / union : 0;
}

// ── Sauvegarde reponse Gemini ─────────────────────────────────────────────────

export async function sauvegarderReponseGemini(question, reponse) {
  if (!db() || !question || !reponse || reponse.length < 10) return;

  // Questions volatiles = jamais mises en cache (etat, quantite, alertes...)
  var type = classifierQuestion(question);
  if (type === 'VOLATILE') return;

  var qNorm = normSeq(question);
  var mots  = extraireMots(question).join(',');

  // Calcul de l'expiration selon le type
  var expiresAt = null;
  if (type === 'SEMI') {
    var exp = new Date();
    exp.setHours(exp.getHours() + 24);
    expiresAt = exp.toISOString();
  }
  // STABLE = pas d'expiration (null = permanent)

  try {
    var existing = await db().getFirstAsync('SELECT id FROM cache_gemini WHERE question_norm = ?', [qNorm]);
    if (existing) {
      await db().runAsync(
        'UPDATE cache_gemini SET reponse = ?, score_utilisation = score_utilisation + 1, timestamp = ?, type_cache = ?, expires_at = ? WHERE question_norm = ?',
        [reponse, new Date().toISOString(), type, expiresAt, qNorm]
      );
    } else {
      await db().runAsync(
        'INSERT INTO cache_gemini (question_norm, question_orig, reponse, mots_cles, type_cache, score_utilisation, timestamp, expires_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
        [qNorm, question, reponse, mots, type, new Date().toISOString(), expiresAt]
      );
    }
  } catch(e) {}
}

// ── Recherche dans le cache ───────────────────────────────────────────────────

export async function chercherDansCache(question, seuilMin) {
  if (!db()) return null;

  // Questions volatiles = jamais servies depuis le cache
  if (classifierQuestion(question) === 'VOLATILE') return null;

  var seuil = seuilMin || 0.45;
  var maintenant = new Date().toISOString();

  try {
    // Exclure les entrees expirees
    var rows = await db().getAllAsync(
      'SELECT question_norm, question_orig, reponse, score_utilisation, type_cache, expires_at ' +
      'FROM cache_gemini ' +
      'WHERE (expires_at IS NULL OR expires_at > ?) ' +
      'ORDER BY score_utilisation DESC LIMIT 200',
      [maintenant]
    );

    var meilleurScore = 0;
    var meilleurReponse = null;
    var meilleurQuestion = null;

    for (var i = 0; i < rows.length; i++) {
      var score = similarite(question, rows[i].question_norm);
      if (score > meilleurScore) {
        meilleurScore = score;
        meilleurReponse = rows[i].reponse;
        meilleurQuestion = rows[i].question_orig;
      }
    }

    if (meilleurScore >= seuil && meilleurReponse) {
      try {
        await db().runAsync(
          'UPDATE cache_gemini SET score_utilisation = score_utilisation + 1 WHERE question_norm = ?',
          [normSeq(meilleurQuestion)]
        );
      } catch(e) {}
      var confiance = meilleurScore >= 0.8 ? '' : ' *(réponse approximative)*';
      return meilleurReponse + confiance;
    }
  } catch(e) {}

  return null;
}

// ── Apprentissage de patterns ─────────────────────────────────────────────────

export async function apprendrePattern(pattern, reponse, contexte) {
  if (!db()) return;
  try {
    await db().runAsync(
      'INSERT OR REPLACE INTO apprentissage (pattern, reponse, contexte, timestamp) VALUES (?, ?, ?, ?)',
      [normSeq(pattern), reponse, contexte || '', new Date().toISOString()]
    );
  } catch(e) {}
}

export async function chercherPattern(question) {
  if (!db()) return null;
  try {
    var rows = await db().getAllAsync('SELECT pattern, reponse FROM apprentissage LIMIT 100');
    var best = 0; var bestRep = null;
    for (var i = 0; i < rows.length; i++) {
      var s = similarite(question, rows[i].pattern);
      if (s > best) { best = s; bestRep = rows[i].reponse; }
    }
    if (best >= 0.6 && bestRep) return bestRep;
  } catch(e) {}
  return null;
}

// ── Stats du cache ────────────────────────────────────────────────────────────

export async function statsCache() {
  if (!db()) return { total: 0, plusUtilisees: [] };
  try {
    var total = await db().getFirstAsync('SELECT COUNT(*) as n FROM cache_gemini');
    var top = await db().getAllAsync(
      'SELECT question_orig, score_utilisation FROM cache_gemini ORDER BY score_utilisation DESC LIMIT 5'
    );
    return { total: (total && total.n) || 0, plusUtilisees: top };
  } catch(e) { return { total: 0, plusUtilisees: [] }; }
}

export async function viderCache() {
  if (!db()) return;
  try {
    await db().runAsync('DELETE FROM cache_gemini');
    await db().runAsync('DELETE FROM apprentissage');
  } catch(e) {}
}

// ── Invalidation après modification de l'inventaire ──────────────────────────
// A appeler depuis app-context apres addMateriel, updateMateriel, deleteMateriel, deleteRoom

export async function invaliderCacheDonnees() {
  if (!db()) return;
  try {
    // Supprimer toutes les entrees non-stables (VOLATILE et SEMI)
    await db().runAsync(
      'DELETE FROM cache_gemini WHERE type_cache = "VOLATILE" OR type_cache = "SEMI" OR type_cache IS NULL'
    );
    // Forcer expiration immediate des SEMI restantes
    await db().runAsync(
      'UPDATE cache_gemini SET expires_at = ? WHERE type_cache = "SEMI"',
      [new Date().toISOString()]
    );
  } catch(e) {}
}

// Invalidation ciblee par entite (salle ou materiel specifique)
export async function invaliderCacheEntite(nomEntite) {
  if (!db() || !nomEntite) return;
  try {
    var n = (nomEntite || '').toLowerCase()
      .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
      .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c');
    // Supprimer toutes les entrees qui mentionnent cette entite
    await db().runAsync(
      'DELETE FROM cache_gemini WHERE question_norm LIKE ?',
      ['%' + n + '%']
    );
  } catch(e) {}
      }

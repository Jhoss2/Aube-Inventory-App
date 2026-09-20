// lib/aube-engine.js
// ============================================================================
// MOTEUR CONVERSATIONNEL AUBE — v2
// 100% local, aucun appel réseau requis, aucune donnée envoyée à l'extérieur.
//
// Remplace l'ancienne cascade (aube-reasoning-engine, aube-actions,
// aube-offline-brain, aube-knowledge-graph, aube-layer-g/h/i, aube-embeddings,
// aube-memory, aube-local-llm) par un pipeline unique et cohérent :
//
//   COMPRÉHENSION → RAISONNEMENT → GÉNÉRATION → APPRENTISSAGE
//
// - COMPRÉHENSION : classification d'intention par similarité TF-IDF (la même
//   famille de technique que les moteurs de recherche), + extraction d'entités
//   bornée aux mots complets (une salle n'est reconnue que si son nom apparaît
//   entièrement, jamais par simple sous-chaîne au milieu d'un mot).
// - RAISONNEMENT : calculs réels sur les données de l'app (aucune invention).
// - GÉNÉRATION : phrases composées à partir de blocs variables (plusieurs
//   formulations par situation, accords grammaticaux, énumérations naturelles)
//   pour éviter l'effet « réponse toute faite ».
// - APPRENTISSAGE : chaque correction de l'utilisateur s'ajoute pour toujours
//   à la mémoire locale (aube-semantic-cache), qui est interrogée avant tout
//   le reste — donc Aube apprend réellement, sans jamais rien envoyer ailleurs.
//
// L'export chatWithAubeStream garde exactement la même signature qu'avant,
// pour que chat-aube.tsx n'ait besoin d'aucune modification.
// ============================================================================

import { chercherDansCache, sauvegarderReponseGemini } from './aube-semantic-cache';
import { rechercherParMotsCles } from './aube-library';
import { saveFaitEB1, getAllFaitsEB1 } from './aube-db';
import { enregistrerLacune, chercherDansConnaissances } from './aube-learner';

// ============================================================================
// SECTION 1 — UTILITAIRES DE TEXTE ET DE GRAMMAIRE FRANÇAISE
// ============================================================================

function normaliser(t) {
  return (t || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

var MOTS_VIDES = [
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'est', 'sont',
  'avec', 'pour', 'dans', 'sur', 'par', 'que', 'qui', 'quoi', 'quand', 'comment',
  'je', 'tu', 'il', 'elle', 'vous', 'nous', 'ils', 'elles', 'me', 'te', 'se',
  'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes',
  'ses', 'nos', 'vos', 'leur', 'leurs', 'au', 'aux', 'en', 'y', 'a', 'ai',
  'as', 'avons', 'avez', 'ont', 'suis', 'es', 'sommes', 'etes', 'peux', 'tu',
  'moi', 'toi', 'lui', 'eux',
];

function tokeniser(t) {
  var n = normaliser(t);
  if (!n) return [];
  return n.split(' ').filter(function (m) {
    return m.length >= 2 && MOTS_VIDES.indexOf(m) === -1;
  });
}

function uniq(arr) {
  var seen = {};
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    var v = arr[i];
    if (v && !seen[v]) { seen[v] = true; out.push(v); }
  }
  return out;
}

// Accord singulier / pluriel simple
function accorder(n, singulier, pluriel) {
  return n === 1 ? singulier : (pluriel || singulier + 's');
}

// Énumération naturelle : "A" / "A et B" / "A, B et C"
function listerNaturellement(items) {
  var arr = items.filter(Boolean);
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr[0] + ' et ' + arr[1];
  return arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1];
}

// Vérifie que `mot` apparaît dans `texte` en tant que groupe de mots complet,
// pas comme sous-chaîne arbitraire (évite qu'un nom court déclenche à tort).
function contientExpression(texteNorm, expressionNorm) {
  if (!expressionNorm) return false;
  var idx = texteNorm.indexOf(expressionNorm);
  if (idx === -1) return false;
  var avant = idx === 0 || texteNorm[idx - 1] === ' ';
  var finIdx = idx + expressionNorm.length;
  var apres = finIdx === texteNorm.length || texteNorm[finIdx] === ' ';
  return avant && apres;
}

// Choisit une formulation en évitant de répéter la toute dernière utilisée
// pour cette même clé — évite l'effet « toujours la même phrase ».
var _dernieresFormulations = {};
function varier(cle, tableau) {
  if (!tableau || tableau.length === 0) return '';
  if (tableau.length === 1) return tableau[0];
  var derniereIdx = _dernieresFormulations[cle];
  var candidatsIdx = [];
  for (var i = 0; i < tableau.length; i++) {
    if (i !== derniereIdx) candidatsIdx.push(i);
  }
  var choixIdx = candidatsIdx[Math.floor(Math.random() * candidatsIdx.length)];
  _dernieresFormulations[cle] = choixIdx;
  return tableau[choixIdx];
}

// Diffuse un texte au fil des mots plutôt que d'un bloc — conserve l'effet de
// frappe progressive de l'ancienne interface, qui appelait un vrai flux réseau.
async function diffuserTexte(texte, onToken) {
  if (!texte) return;
  var mots = texte.split(' ');
  for (var i = 0; i < mots.length; i++) {
    var morceau = (i === 0 ? '' : ' ') + mots[i];
    onToken(morceau);
    // eslint-disable-next-line no-await-in-loop
    await new Promise(function (resolve) {
      setTimeout(resolve, 16 + Math.random() * 26);
    });
  }
}

// ============================================================================
// SECTION 2 — CLASSIFICATION D'INTENTION (similarité TF-IDF)
// ============================================================================
// Chaque intention est représentée par plusieurs formulations d'exemple.
// Une nouvelle question est comparée à TOUTES ces formulations ; l'intention
// de la formulation la plus proche (cosinus) est retenue, avec un score de
// confiance. Contrairement à un simple mot-clé, ceci généralise correctement
// aux paraphrases ("combien de chaises cassées" ≈ "y a-t-il des chaises en
// mauvais état") sans jamais laisser un mot isolé décider seul de la réponse.

var EXEMPLES_INTENTIONS = {
  SALUTATION: [
    'bonjour', 'salut', 'bonsoir', 'coucou', 'hello', 'salut aube',
    'bonjour aube', 'comment vas tu', 'ça va',
  ],
  REMERCIEMENT: [
    'merci', 'merci beaucoup', 'super merci', 'c est parfait merci',
    'merci pour ton aide', 'je te remercie', 'top merci beaucoup',
  ],
  STATS_GLOBAL: [
    'combien de materiels avons nous', 'combien de salles y a t il',
    'quel est le nombre total de materiels', 'donne moi les statistiques generales',
    'combien d objets sont enregistres au total', 'quel est le total de l inventaire',
    'combien de materiels au total dans l application', 'quelle est la taille de l inventaire',
    'combien de salles sont enregistrees', 'fais moi un bilan global de l inventaire',
    'combien de materiels sont enregistres dans la base',
  ],
  STATS_FILTRE: [
    'combien de materiels sont en panne', 'combien de chaises sont endommagees',
    'combien d objets sont en bon etat', 'combien de materiels neufs avons nous',
    'quels materiels sont casses', 'combien de climatiseurs y a t il',
    'combien de materiels dans le bloc c', 'combien d objets dans cette salle',
    'combien de projecteurs sont en mauvais etat', 'quels materiels sont uses',
    'combien de chaises avons nous', 'combien de tables sont en mauvais etat',
    'y a t il des materiels endommages',
  ],
  LOCALISER_MATERIEL: [
    'ou se trouve le projecteur', 'dans quelle salle est le videoprojecteur',
    'ou puis je trouver un ordinateur', 'localise moi les tables disponibles',
    'dans quel bloc y a t il des imprimantes', 'ou sont rangees les chaises',
    'trouve moi une salle avec un tableau', 'quelle salle a un climatiseur sharp',
    'ou est le materiel que je cherche', 'dans quelle salle se trouve ce type d objet',
  ],
  LOCALISER_SALLE: [
    'parle moi de cette salle', 'donne moi les infos sur cette salle',
    'que contient cette salle', 'quel est le contenu de ce bloc',
    'decris moi cette salle', 'qu est ce qu il y a dans cette salle',
    'montre moi ce qu il y a dans cette salle',
  ],
  LISTER_ALERTES: [
    'quelles sont les alertes en cours', 'y a t il des problemes urgents',
    'montre moi les alertes critiques', 'quels materiels necessitent une attention',
    'quels sont les elements a risque en ce moment', 'y a t il quelque chose d urgent',
    'quelles alertes sont actives',
  ],
  LISTER_RENOUVELLEMENT: [
    'quels renouvellements sont proches', 'quels materiels doivent etre renouveles',
    'y a t il des dates de renouvellement depassees', 'quels contrats expirent bientot',
    'quels objets arrivent en fin de vie', 'quels renouvellements sont urgents',
  ],
  COMPARER: [
    'compare ces deux blocs', 'quelle salle est la mieux equipee',
    'quel bloc est le plus degrade', 'quelle est la difference entre ces deux salles',
    'quel bloc a le plus de materiels', 'compare ces deux salles entre elles',
  ],
  SCORE_SANTE: [
    'quel est le score de sante de ce bloc', 'comment se porte cette salle',
    'quel est l etat general de ce bloc', 'evalue la sante de l inventaire',
    'quel est le score de sante global',
  ],
  COMMENT_FAIRE: [
    'comment ajouter un materiel', 'comment creer une nouvelle salle',
    'comment generer un rapport pdf', 'comment modifier l etat d un objet',
    'comment programmer un rappel', 'comment supprimer un materiel',
    'comment personnaliser l application', 'comment changer l arriere plan',
    'comment utiliser la recherche', 'comment fonctionne le score de sante',
    'comment acceder aux parametres', 'comment faire une sauvegarde de mes donnees',
    'comment transferer mes donnees vers un autre telephone',
    'comment envoyer l application a quelqu un d autre',
  ],
  AIDE_GENERALE: [
    'que peux tu faire', 'a quoi sers tu', 'aide moi', 'qui es tu',
    'quelles sont tes fonctionnalites', 'comment tu marches', 'que sais tu faire',
  ],
};

var _indexTfIdf = null;

function construireIndexSiNecessaire() {
  if (_indexTfIdf) return _indexTfIdf;

  var docs = [];
  var intentions = Object.keys(EXEMPLES_INTENTIONS);
  for (var i = 0; i < intentions.length; i++) {
    var phrases = EXEMPLES_INTENTIONS[intentions[i]];
    for (var j = 0; j < phrases.length; j++) {
      docs.push({ intention: intentions[i], tokens: tokeniser(phrases[j]) });
    }
  }

  var vocab = {};
  var compteur = 0;
  for (var d = 0; d < docs.length; d++) {
    for (var t = 0; t < docs[d].tokens.length; t++) {
      var mot = docs[d].tokens[t];
      if (vocab[mot] === undefined) vocab[mot] = compteur++;
    }
  }

  var N = docs.length;
  var df = new Array(compteur).fill(0);
  for (var d2 = 0; d2 < docs.length; d2++) {
    var vus = {};
    for (var t2 = 0; t2 < docs[d2].tokens.length; t2++) {
      var m2 = docs[d2].tokens[t2];
      if (!vus[m2]) { vus[m2] = true; df[vocab[m2]]++; }
    }
  }
  var idf = df.map(function (c) { return Math.log((N + 1) / (c + 1)) + 1; });

  function vecteurDe(tokens) {
    if (!tokens || tokens.length === 0) return {};
    var tf = {};
    for (var k = 0; k < tokens.length; k++) {
      var mot2 = tokens[k];
      if (vocab[mot2] === undefined) continue;
      tf[vocab[mot2]] = (tf[vocab[mot2]] || 0) + 1;
    }
    var vec = {};
    var cles = Object.keys(tf);
    for (var kk = 0; kk < cles.length; kk++) {
      var idxV = cles[kk];
      vec[idxV] = (tf[idxV] / tokens.length) * idf[idxV];
    }
    return vec;
  }

  for (var d3 = 0; d3 < docs.length; d3++) {
    docs[d3].vecteur = vecteurDe(docs[d3].tokens);
  }

  _indexTfIdf = { docs: docs, vecteurDe: vecteurDe };
  return _indexTfIdf;
}

function similariteCosinusSparse(v1, v2) {
  var cles1 = Object.keys(v1);
  var dot = 0;
  for (var i = 0; i < cles1.length; i++) {
    var k = cles1[i];
    if (v2[k] !== undefined) dot += v1[k] * v2[k];
  }
  var n1 = 0;
  for (var j = 0; j < cles1.length; j++) n1 += v1[cles1[j]] * v1[cles1[j]];
  var cles2 = Object.keys(v2);
  var n2 = 0;
  for (var m = 0; m < cles2.length; m++) n2 += v2[cles2[m]] * v2[cles2[m]];
  var denom = Math.sqrt(n1) * Math.sqrt(n2);
  return denom > 0 ? dot / denom : 0;
}

function compterMotsCommuns(t1, t2) {
  var set2 = {};
  for (var i = 0; i < t2.length; i++) set2[t2[i]] = true;
  var n = 0;
  for (var j = 0; j < t1.length; j++) if (set2[t1[j]]) n++;
  return n;
}

function classifierIntention(texte) {
  var index = construireIndexSiNecessaire();
  var tokens = tokeniser(texte);
  if (tokens.length === 0) return { intention: 'INCONNU', confiance: 0 };

  var vecQ = index.vecteurDe(tokens);
  var meilleur = { intention: 'INCONNU', confiance: 0 };

  for (var i = 0; i < index.docs.length; i++) {
    var score = similariteCosinusSparse(vecQ, index.docs[i].vecteur);
    if (score > meilleur.confiance) {
      var communs = compterMotsCommuns(tokens, index.docs[i].tokens);
      var assezDeSignal = communs >= 2 || (communs >= 1 && tokens.length <= 2);
      if (assezDeSignal) meilleur = { intention: index.docs[i].intention, confiance: score };
    }
  }
  return meilleur;
}

// ============================================================================
// SECTION 3 — EXTRACTION D'ENTITÉS (salles, blocs, matériels, catégories, états)
// ============================================================================

var ETATS_CONNUS = ['neuf', 'bon', 'use', 'endommage', 'en panne', 'casse', 'defectueux'];
var LOCUTIONS_ETAT = {
  neuf:          { sing: 'neuf',        plur: 'neufs' },
  bon:           { sing: 'en bon état', plur: 'en bon état' },
  use:           { sing: 'usé',         plur: 'usés' },
  endommage:     { sing: 'endommagé',   plur: 'endommagés' },
  'en panne':    { sing: 'en panne',    plur: 'en panne' },
  casse:         { sing: 'cassé',       plur: 'cassés' },
  defectueux:    { sing: 'défectueux',  plur: 'défectueux' },
};

function locutionEtat(etatBrut, n) {
  var norm = normaliser(etatBrut);
  var loc = LOCUTIONS_ETAT[norm];
  if (loc) return n === 1 ? loc.sing : loc.plur;
  return 'à l\'état ' + (etatBrut || 'non renseigné').toLowerCase();
}

function extraireEntites(texte, appData) {
  var n = normaliser(texte);
  var salles = (appData && appData.salles) || [];
  var materiels = (appData && appData.materiels) || [];
  var categoriesConnues = uniq(materiels.map(function (m) { return (m.category || '').trim(); }));

  var entites = { salles: [], materiels: [], blocs: [], categories: [], etats: [] };

  for (var i = 0; i < salles.length; i++) {
    var nomSalle = normaliser(salles[i].name || '');
    if (nomSalle.length >= 3 && contientExpression(n, nomSalle)) entites.salles.push(salles[i]);
  }

  // Capture TOUS les blocs mentionnés ("compare le bloc a et le bloc b"), pas
  // seulement le premier — important pour les comparaisons.
  var blocRegex = /bloc\s+([a-f])\b/g;
  var mb;
  while ((mb = blocRegex.exec(n)) !== null) entites.blocs.push(mb[1].toUpperCase());
  entites.blocs = uniq(entites.blocs);

  for (var c = 0; c < categoriesConnues.length; c++) {
    var catN = normaliser(categoriesConnues[c]);
    if (catN.length >= 3 && contientExpression(n, catN)) entites.categories.push(categoriesConnues[c]);
  }

  for (var j = 0; j < materiels.length; j++) {
    var nomM = normaliser(materiels[j].nom || '');
    if (nomM.length >= 3 && contientExpression(n, nomM)) entites.materiels.push(materiels[j]);
  }

  for (var e = 0; e < ETATS_CONNUS.length; e++) {
    if (n.indexOf(ETATS_CONNUS[e]) !== -1) entites.etats.push(ETATS_CONNUS[e]);
  }

  return entites;
}

function decrireFilstres(entites, total) {
  var morceaux = [];
  if (entites.categories.length > 0) morceaux.push('pour ' + listerNaturellement(entites.categories));
  if (entites.etats.length > 0) {
    var etatsAffiches = entites.etats.map(function (e) { return locutionEtat(e, total === undefined ? 2 : total); });
    morceaux.push(listerNaturellement(etatsAffiches));
  }
  if (entites.blocs.length > 0) morceaux.push('dans le bloc ' + listerNaturellement(entites.blocs));
  if (entites.salles.length > 0) morceaux.push('dans ' + listerNaturellement(entites.salles.map(function (s) { return s.name; })));
  return morceaux.join(' ');
}

// ============================================================================
// SECTION 4 — RAISONNEMENT DÉTERMINISTE (calculs réels, jamais inventés)
// ============================================================================

function filtrerMateriels(appData, entites) {
  var materiels = (appData && appData.materiels) || [];
  var salles = (appData && appData.salles) || [];
  var res = materiels;

  if (entites.salles && entites.salles.length > 0) {
    var idsSalles = entites.salles.map(function (s) { return String(s.id); });
    res = res.filter(function (m) { return idsSalles.indexOf(String(m.roomId)) !== -1; });
  }
  if (entites.blocs && entites.blocs.length > 0) {
    var idsSallesBloc = salles
      .filter(function (s) { return entites.blocs.indexOf(String(s.blockId)) !== -1; })
      .map(function (s) { return String(s.id); });
    res = res.filter(function (m) { return idsSallesBloc.indexOf(String(m.roomId)) !== -1; });
  }
  if (entites.categories && entites.categories.length > 0) {
    var catsN = entites.categories.map(normaliser);
    res = res.filter(function (m) {
      var mc = normaliser(m.category || '');
      for (var i = 0; i < catsN.length; i++) if (mc.indexOf(catsN[i]) !== -1) return true;
      return false;
    });
  }
  if (entites.etats && entites.etats.length > 0) {
    res = res.filter(function (m) {
      var me = normaliser(m.etat || '');
      for (var i = 0; i < entites.etats.length; i++) if (me.indexOf(entites.etats[i]) !== -1) return true;
      return false;
    });
  }
  return res;
}

function calculerStats(entites, appData) {
  var materiels = filtrerMateriels(appData, entites);
  var parEtat = {};
  for (var i = 0; i < materiels.length; i++) {
    var e = materiels[i].etat || 'Non renseigné';
    parEtat[e] = (parEtat[e] || 0) + 1;
  }
  return { total: materiels.length, parEtat: parEtat };
}

var POIDS_ETAT = { neuf: 100, bon: 80, use: 50, endommage: 15, 'en panne': 0, casse: 0, defectueux: 10 };

function calculerScoreSante(entites, appData) {
  var materiels = filtrerMateriels(appData, entites);
  if (materiels.length === 0) return null;
  var total = 0;
  for (var i = 0; i < materiels.length; i++) {
    var e = normaliser(materiels[i].etat || '');
    total += POIDS_ETAT[e] !== undefined ? POIDS_ETAT[e] : 60;
  }
  return { score: Math.round(total / materiels.length), nb: materiels.length };
}

function localiserMateriel(entites, appData) {
  var salles = (appData && appData.salles) || [];
  var candidats = filtrerMateriels(appData, entites);
  // Si aucun filtre catégorie/état n'a matché mais qu'un nom précis existe déjà
  // dans les entités matériels, on l'utilise directement.
  if (candidats.length === 0 && entites.materiels && entites.materiels.length > 0) {
    var idsM = entites.materiels.map(function (m) { return m.id; });
    candidats = ((appData && appData.materiels) || []).filter(function (m) { return idsM.indexOf(m.id) !== -1; });
  }

  var parSalle = {};
  for (var i = 0; i < candidats.length; i++) {
    var rid = String(candidats[i].roomId);
    if (!parSalle[rid]) parSalle[rid] = [];
    parSalle[rid].push(candidats[i]);
  }
  var resultats = [];
  var ids = Object.keys(parSalle);
  for (var j = 0; j < ids.length; j++) {
    var salle = salles.find(function (s) { return String(s.id) === ids[j]; });
    resultats.push({ salle: salle, items: parSalle[ids[j]] });
  }
  return resultats;
}

function listerAlertes(appData) {
  var materiels = (appData && appData.materiels) || [];
  var salles = (appData && appData.salles) || [];
  var critiques = materiels.filter(function (m) {
    var e = normaliser(m.etat || '');
    return e === 'en panne' || e === 'endommage' || e === 'casse' || e === 'defectueux';
  });
  return critiques.map(function (m) {
    var s = salles.find(function (s2) { return String(s2.id) === String(m.roomId); });
    return { materiel: m, salle: s };
  });
}

function listerRenouvellements(appData) {
  var materiels = (appData && appData.materiels) || [];
  var salles = (appData && appData.salles) || [];
  var now = new Date(); now.setHours(0, 0, 0, 0);
  var out = [];
  for (var i = 0; i < materiels.length; i++) {
    var m = materiels[i];
    if (!m.dateRenouvellement) continue;
    try {
      var dr = new Date(m.dateRenouvellement); dr.setHours(0, 0, 0, 0);
      var diffJours = Math.ceil((dr.getTime() - now.getTime()) / 86400000);
      if (diffJours <= 30) {
        var s = salles.find(function (s2) { return String(s2.id) === String(m.roomId); });
        out.push({ materiel: m, salle: s, diffJours: diffJours });
      }
    } catch (e) { /* date invalide, ignorée */ }
  }
  out.sort(function (a, b) { return a.diffJours - b.diffJours; });
  return out;
}

// ============================================================================
// SECTION 5 — ACTIONS (créer salle, ajouter matériel, rappel)
// ============================================================================
// Détection resserrée : seules des formulations explicites déclenchent une
// action ; une simple question sur un sujet proche ne modifie jamais rien.

function detecterAction(texte) {
  var n = normaliser(texte);
  if (/^(cree|creer|ajoute|ajouter)\s+(une\s+)?salle/.test(n)) return 'CREER_SALLE';
  if (/^(rappelle moi|rappel|programme un rappel)/.test(n)) return 'RAPPEL';
  return null;
}

// Le verbe « comparer » avec au moins deux entités identifiées force
// directement l'intention COMPARER : le TF-IDF seul confond parfois cette
// demande avec une simple question de stats (mot commun « bloc »).
function detecterIntentionExplicite(texte, entites) {
  var n = normaliser(texte);
  if (/\b(compare|comparer|comparaison)\b/.test(n) && (entites.blocs.length >= 2 || entites.salles.length >= 2)) {
    return 'COMPARER';
  }
  return null;
}

function reponseAction(action) {
  if (action === 'CREER_SALLE') {
    return 'Pour créer une salle précisément comme vous le souhaitez (bon bloc, bon niveau), utilisez le bouton + depuis l\'écran du bloc concerné — je préfère vous y laisser la main plutôt que de deviner à votre place.';
  }
  if (action === 'RAPPEL') {
    return 'Notez ce rappel depuis les alertes ou les notes de l\'application pour l\'instant — je ne programme pas encore les rappels moi-même directement dans cette version.';
  }
  return null;
}

// ============================================================================
// SECTION 6 — MÉMOIRE CONVERSATIONNELLE COURTE (suivi de contexte)
// ============================================================================

var _contexteParSession = {};
var _dernierEchangeParSession = {};

// Seules ces intentions ont un sens à « suivre » ("et pour le bloc B ?") —
// une salutation ou un remerciement ne doit jamais devenir le contexte d'un
// message suivant, même s'il a été classé avec une bonne confiance.
var INTENTIONS_AVEC_CONTEXTE = [
  'STATS_GLOBAL', 'STATS_FILTRE', 'LOCALISER_MATERIEL', 'LOCALISER_SALLE',
  'COMPARER', 'SCORE_SANTE', 'LISTER_ALERTES', 'LISTER_RENOUVELLEMENT',
];

function estConnecteurDeSuivi(texte) {
  var n = normaliser(texte);
  return /^(et\s|aussi\s|pareil|meme chose|idem|et pour|et dans)/.test(n);
}

function resoudreIntentionAvecContexte(texte, classification, entites, sessionId) {
  var precedent = _contexteParSession[sessionId];
  var aDesEntites = entites.blocs.length > 0 || entites.salles.length > 0 ||
    entites.categories.length > 0 || entites.etats.length > 0;
  var suivProbable = (classification.confiance < 0.14 || estConnecteurDeSuivi(texte)) && precedent && aDesEntites;

  if (suivProbable) return precedent.intention;
  return classification.intention;
}

// ============================================================================
// SECTION 7 — GÉNÉRATION DE LANGAGE NATUREL (variée, jamais figée)
// ============================================================================

function composerStats(entites, appData) {
  var donnees = calculerStats(entites, appData);

  if (donnees.total === 0) {
    var filtresZero = decrireFilstres(entites, 1);
    var ouvertureZero = varier('stats_zero', [
      'Bonne nouvelle : je ne trouve aucun élément',
      'Plutôt rassurant : rien ne correspond',
      'Je ne trouve rien de ce genre',
    ]);
    return ouvertureZero + (filtresZero ? ' ' + filtresZero : '') + '.';
  }

  var filtresDecrits = decrireFilstres(entites, donnees.total);
  var ouverture = varier('stats', [
    'Alors, voyons ça :', 'D\'après ce que j\'ai sous les yeux,', 'Je viens de vérifier —',
    'Voici ce que je trouve :',
  ]);
  var phrase = ouverture + ' il y a ' + donnees.total + ' ' +
    accorder(donnees.total, 'élément', 'éléments') + (filtresDecrits ? ' ' + filtresDecrits : '') + '.';

  var etatsClefs = Object.keys(donnees.parEtat);
  if (etatsClefs.length > 1) {
    var details = etatsClefs.map(function (e) {
      return donnees.parEtat[e] + ' ' + locutionEtat(e, donnees.parEtat[e]);
    });
    phrase += ' Le détail : ' + listerNaturellement(details) + '.';
  }
  return phrase;
}

function composerLocalisation(entites, appData) {
  var resultats = localiserMateriel(entites, appData);
  if (resultats.length === 0) {
    return varier('locate_zero', [
      'Je ne trouve rien de correspondant dans les salles enregistrées pour le moment.',
      'Aucune salle ne semble contenir ce type de matériel actuellement.',
    ]);
  }
  var ouverture = varier('locate', [
    'Je trouve ça ici :', 'Voici où se trouve ce que vous cherchez :', 'Alors, réponse :',
  ]);
  var morceaux = resultats.map(function (r) {
    var nomSalle = r.salle ? r.salle.name : 'une salle non identifiée';
    var bloc = r.salle && r.salle.blockId ? ' (bloc ' + r.salle.blockId + ')' : '';
    return nomSalle + bloc + ' — ' + r.items.length + ' ' + accorder(r.items.length, 'élément', 'éléments');
  });
  return ouverture + ' ' + listerNaturellement(morceaux) + '.';
}

function composerInfoSalle(entites, appData) {
  if (!entites.salles || entites.salles.length === 0) {
    return 'Dites-moi le nom exact de la salle qui vous intéresse et je vous détaille son contenu.';
  }
  var salle = entites.salles[0];
  var materiels = ((appData && appData.materiels) || []).filter(function (m) { return String(m.roomId) === String(salle.id); });
  var sante = calculerScoreSante({ salles: [salle], blocs: [], categories: [], etats: [] }, appData);

  var ouverture = varier('info_salle', ['Alors,', 'D\'accord, voyons —', 'Je regarde —']);
  var phrase = ouverture + ' ' + salle.name + (salle.blockId ? ' (bloc ' + salle.blockId + ')' : '') +
    ' compte ' + materiels.length + ' ' + accorder(materiels.length, 'élément', 'éléments') + '.';
  if (sante) phrase += ' Son score de santé global est de ' + sante.score + ' sur 100.';
  return phrase;
}

function composerAlertes(appData) {
  var alertes = listerAlertes(appData);
  if (alertes.length === 0) {
    return varier('alertes_zero', [
      'Tout va bien : je ne vois aucune alerte critique en ce moment.',
      'Rien à signaler — aucun matériel n\'est en état critique actuellement.',
    ]);
  }
  var ouverture = varier('alertes', ['Attention,', 'À surveiller :', 'Voici ce qui demande votre attention :']);
  var morceaux = alertes.slice(0, 5).map(function (a) {
    var nomSalle = a.salle ? a.salle.name : 'salle inconnue';
    return (a.materiel.nom || 'un matériel') + ' (' + nomSalle + ')';
  });
  var suffixe = alertes.length > 5 ? ', et ' + (alertes.length - 5) + ' autre(s)' : '';
  return ouverture + ' ' + listerNaturellement(morceaux) + suffixe + '.';
}

function composerRenouvellements(appData) {
  var items = listerRenouvellements(appData);
  if (items.length === 0) {
    return 'Aucun renouvellement urgent à l\'horizon des 30 prochains jours — tout est à jour.';
  }
  var ouverture = varier('renouv', ['À prévoir prochainement :', 'Ces échéances arrivent :']);
  var morceaux = items.slice(0, 5).map(function (it) {
    var nomSalle = it.salle ? it.salle.name : 'salle inconnue';
    if (it.diffJours < 0) return (it.materiel.nom || 'un matériel') + ' (' + nomSalle + ', dépassé de ' + Math.abs(it.diffJours) + ' j)';
    return (it.materiel.nom || 'un matériel') + ' (' + nomSalle + ', dans ' + it.diffJours + ' j)';
  });
  return ouverture + ' ' + listerNaturellement(morceaux) + '.';
}

function composerComparaison(entites, appData) {
  var salles = (appData && appData.salles) || [];
  var cibles = [];
  if (entites.blocs && entites.blocs.length >= 1) {
    cibles = entites.blocs.map(function (b) { return { type: 'bloc', id: b, label: 'Bloc ' + b }; });
  } else if (entites.salles && entites.salles.length >= 2) {
    cibles = entites.salles.map(function (s) { return { type: 'salle', id: s.id, label: s.name, salle: s }; });
  }

  if (cibles.length < 2) {
    // Repli : comparer automatiquement les blocs existants entre eux.
    var blocsPresents = uniq(salles.map(function (s) { return s.blockId; }).filter(Boolean));
    cibles = blocsPresents.map(function (b) { return { type: 'bloc', id: b, label: 'Bloc ' + b }; });
  }

  var scores = cibles.map(function (c) {
    var f = c.type === 'bloc' ? { blocs: [c.id], salles: [], categories: [], etats: [] } : { salles: [c.salle], blocs: [], categories: [], etats: [] };
    var s = calculerScoreSante(f, appData);
    return { label: c.label, score: s ? s.score : null, nb: s ? s.nb : 0 };
  }).filter(function (r) { return r.score !== null; });

  if (scores.length < 2) {
    return 'Il me faut au moins deux éléments avec du matériel enregistré pour faire une vraie comparaison.';
  }

  scores.sort(function (a, b) { return b.score - a.score; });
  var meilleur = scores[0];
  var pire = scores[scores.length - 1];
  var ouverture = varier('comparer', ['Sur la base des scores de santé :', 'En comparant :']);
  var detail = scores.map(function (s) { return s.label + ' (' + s.score + '/100)'; });
  return ouverture + ' ' + listerNaturellement(detail) + '. ' +
    meilleur.label + ' est actuellement le mieux équipé, et ' + pire.label + ' celui qui demande le plus d\'attention.';
}

function composerScoreSante(entites, appData) {
  var sante = calculerScoreSante(entites, appData);
  if (!sante) return 'Je n\'ai pas assez de matériel enregistré ici pour calculer un score fiable.';
  var qualificatif = sante.score >= 80 ? 'plutôt bon' : sante.score >= 55 ? 'correct, mais perfectible' : 'préoccupant';
  return 'Le score de santé calculé sur ' + sante.nb + ' ' + accorder(sante.nb, 'élément', 'éléments') +
    ' est de ' + sante.score + '/100 — ' + qualificatif + '.';
}

// ── Guide d'utilisation (réponses « comment faire », écrites une bonne fois) ─

var GUIDE_UTILISATION = [
  { motsCles: ['ajouter', 'materiel'], reponse: 'Pour ajouter un matériel : ouvrez la salle concernée, appuyez sur « Ajouter du matériel », choisissez une catégorie puis remplissez la fiche (nom, marque, couleur, état, dates). Ça s\'enregistre immédiatement.' },
  { motsCles: ['creer', 'salle'], reponse: 'Une salle se crée depuis l\'écran d\'un bloc, via le bouton + en bas à droite. Pensez à bien choisir le niveau dans la liste déroulante pour qu\'elle apparaisse au bon endroit dans le classement des étages.' },
  { motsCles: ['rapport', 'pdf'], reponse: 'Depuis le menu latéral, la section téléchargement vous laisse choisir une salle et génère un PDF propre avec les photos et fiches de tout son matériel.' },
  { motsCles: ['rappel'], reponse: 'Les rappels et notes se gèrent depuis l\'écran dédié aux notes — je ne les programme pas encore moi-même directement en conversation.' },
  { motsCles: ['arriere', 'plan'], reponse: 'Les arrière-plans se personnalisent depuis Paramètres : chaque écran a sa propre image, choisie dans votre galerie.' },
  { motsCles: ['sauvegarde'], reponse: 'Depuis le menu latéral, « Sauvegarde complète » crée un seul fichier avec toutes vos données et photos, à envoyer par le moyen de votre choix. Sur le nouvel appareil, « Restaurer une sauvegarde » remet tout en place, sans rien recommencer à zéro.' },
  { motsCles: ['transferer', 'autre', 'telephone'], reponse: 'Depuis le menu latéral, « Sauvegarde complète » crée un seul fichier avec toutes vos données et photos, à envoyer par le moyen de votre choix. Sur le nouvel appareil, « Restaurer une sauvegarde » remet tout en place, sans rien recommencer à zéro.' },
  { motsCles: ['recherche'], reponse: 'La barre de recherche en haut de l\'accueil trouve à la fois les salles et les matériels par leur nom.' },
  { motsCles: ['score', 'sante'], reponse: 'Le score de santé résume l\'état général d\'une salle ou d\'un bloc en un seul chiffre, calculé à partir de l\'état réel de chaque matériel qu\'il contient.' },
  { motsCles: ['supprimer'], reponse: 'Pour supprimer un matériel, ouvrez sa fiche depuis la salle concernée : l\'icône corbeille demande une confirmation avant d\'effacer quoi que ce soit.' },
  { motsCles: ['modifier', 'etat'], reponse: 'L\'état d\'un matériel se modifie en ouvrant sa fiche détaillée depuis la liste de sa salle.' },
];

function chercherGuide(texte) {
  var tokens = tokeniser(texte);
  var meilleur = null;
  var meilleurScore = 0;
  for (var i = 0; i < GUIDE_UTILISATION.length; i++) {
    var hits = 0;
    var motsCles = GUIDE_UTILISATION[i].motsCles;
    for (var j = 0; j < motsCles.length; j++) {
      if (tokens.indexOf(normaliser(motsCles[j])) !== -1) hits++;
    }
    if (hits > meilleurScore) { meilleurScore = hits; meilleur = GUIDE_UTILISATION[i]; }
  }
  return meilleurScore > 0 ? meilleur.reponse : null;
}

function genererReponsePourIntention(intention, entites, appData) {
  switch (intention) {
    case 'SALUTATION':
      return varier('salut', [
        'Bonjour ! Comment puis-je vous aider avec l\'inventaire aujourd\'hui ?',
        'Salut ! Je suis là si vous avez besoin d\'un chiffre ou d\'une info sur une salle.',
        'Bonjour ! Dites-moi ce qu\'il vous faut.',
      ]);
    case 'REMERCIEMENT':
      return varier('merci', [
        'Avec plaisir !', 'Je suis là pour ça.', 'De rien, n\'hésitez pas si besoin.',
      ]);
    case 'STATS_GLOBAL':
    case 'STATS_FILTRE':
      return composerStats(entites, appData);
    case 'LOCALISER_MATERIEL':
      return composerLocalisation(entites, appData);
    case 'LOCALISER_SALLE':
      return composerInfoSalle(entites, appData);
    case 'LISTER_ALERTES':
      return composerAlertes(appData);
    case 'LISTER_RENOUVELLEMENT':
      return composerRenouvellements(appData);
    case 'COMPARER':
      return composerComparaison(entites, appData);
    case 'SCORE_SANTE':
      return composerScoreSante(entites, appData);
    case 'COMMENT_FAIRE':
      return null; // traité séparément via chercherGuide (texte brut nécessaire)
    case 'AIDE_GENERALE':
      return 'Je m\'occupe de l\'inventaire : je peux vous donner des chiffres, localiser du matériel, comparer des salles ou des blocs, lister les alertes et les renouvellements à venir, et répondre aux questions sur le fonctionnement de l\'application.';
    default:
      return null;
  }
}

// ============================================================================
// SECTION 8 — APPRENTISSAGE LOCAL PERMANENT (aucun envoi externe)
// ============================================================================

var SIGNAUX_CORRECTION = [
  'non aube', 'non,', 'c est faux', "c'est faux", 'incorrect', 'tu te trompes',
  'ca ne marche pas', 'ca ne fonctionne pas', 'mauvaise reponse', 'tu as tort',
  'ce n est pas ca', 'pas du tout', 'absolument pas', 'corrige',
];

function detecterSignalCorrection(texte) {
  var n = normaliser(texte);
  for (var i = 0; i < SIGNAUX_CORRECTION.length; i++) {
    if (n.indexOf(normaliser(SIGNAUX_CORRECTION[i])) !== -1) return true;
  }
  return false;
}

function extraireCorrection(texte) {
  var patterns = [
    /non,?\s+(?:c'?est|il faut|la bonne reponse est|plutot)\s+(.+)/i,
    /(?:la bonne reponse|la reponse correcte|il faut)\s+(?:est|c'est)?\s+(.+)/i,
    /(?:en fait|plutot|correct(?:ement)?)[,:]?\s+(.+)/i,
    /(?:corrige[: ]+)(.+)/i,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = texte.match(patterns[i]);
    if (m && m[1] && m[1].trim().length > 3) return m[1].trim();
  }
  return null;
}

async function apprendreCorrection(question, bonneReponse) {
  if (!question || !bonneReponse) return;
  try { await sauvegarderReponseGemini(question, bonneReponse); } catch (e) { /* silencieux */ }
}

async function chercherDansConnaissancesLocales(texte) {
  try {
    var rep = await chercherDansCache(texte, 0.45);
    if (rep) return rep;
  } catch (e) { /* silencieux */ }
  try {
    var rep2 = await chercherDansConnaissances(texte);
    if (rep2) return rep2;
  } catch (e) { /* silencieux */ }
  return null;
}

async function chercherDansBibliotheque(texte) {
  try {
    var resultats = await rechercherParMotsCles(texte, 2);
    if (resultats && resultats.length > 0 && resultats[0].score > 0) {
      var ouverture = varier('biblio', ['D\'après les documents que vous avez importés,', 'Je trouve ceci dans la bibliothèque :']);
      return ouverture + ' ' + resultats[0].texte.slice(0, 400) + (resultats[0].texte.length > 400 ? '…' : '');
    }
  } catch (e) { /* silencieux */ }
  return null;
}

function genererReponseInconnue(texte) {
  return varier('inconnu', [
    'Je n\'ai pas de réponse fiable pour ça pour l\'instant — reformulez, ou dites-moi la bonne réponse et je la retiendrai.',
    'Je ne suis pas sûre de bien comprendre cette question. Vous pouvez me corriger si vous connaissez la réponse, je m\'en souviendrai.',
    'Ça sort de ce que je sais faire pour le moment. Une reformulation m\'aiderait, ou dites-le-moi directement.',
  ]);
}

// ============================================================================
// SECTION 9 — MODE CRÉATEUR (EB1) — mémorisation permanente légère
// ============================================================================

async function traiterFaitEB1(texte) {
  var m = texte.match(/retiens que\s+(.+)/i) || texte.match(/n'oublie jamais que\s+(.+)/i);
  if (m && m[1] && m[1].trim().length > 3) {
    var valeur = m[1].trim();
    var cle = 'fait_' + Date.now();
    try { await saveFaitEB1(cle, valeur); } catch (e) { /* silencieux */ }
    return 'Noté, Monsieur Belem — je m\'en souviendrai durablement.';
  }
  return null;
}

// Recherche parmi les faits permanents enseignés par le créateur (mode EB1)
async function chercherFaitEB1(texte) {
  try {
    var faits = await getAllFaitsEB1();
    if (!faits || faits.length === 0) return null;
    var tokens = tokeniser(texte);
    if (tokens.length === 0) return null;

    var meilleur = null;
    var meilleurScore = 0;
    for (var i = 0; i < faits.length; i++) {
      var tokensValeur = tokeniser(faits[i].valeur || '');
      var hits = 0;
      for (var j = 0; j < tokens.length; j++) {
        if (tokensValeur.indexOf(tokens[j]) !== -1) hits++;
      }
      if (hits > meilleurScore) { meilleurScore = hits; meilleur = faits[i].valeur; }
    }
    return meilleurScore >= 2 ? meilleur : null;
  } catch (e) { return null; }
}

// ============================================================================
// SECTION 10 — ORCHESTRATEUR PRINCIPAL (point d'entrée conservé à l'identique)
// ============================================================================

export async function chatWithAubeStream(userText, systemPrompt, appData, history, onToken, sessionId, appContext) {
  var texteOriginal = userText || '';
  var estCreateur = texteOriginal.indexOf('EB1') === 0;
  var texte = estCreateur ? texteOriginal.slice(3).trim() : texteOriginal;
  var cleSession = sessionId || 'defaut';

  var reponseFinale = null;

  try {
    // 1. Correction explicite de l'utilisateur → apprentissage immédiat et permanent
    if (detecterSignalCorrection(texte)) {
      var correction = extraireCorrection(texte);
      if (correction) {
        var dernier = _dernierEchangeParSession[cleSession];
        await apprendreCorrection(dernier ? dernier.question : texte, correction);
        reponseFinale = 'Compris, merci pour la précision — je m\'en souviendrai la prochaine fois.';
      }
    }

    // 2. Mode créateur — mémorisation de faits permanents sur simple demande
    if (!reponseFinale && estCreateur) {
      var repFait = await traiterFaitEB1(texte);
      if (repFait) reponseFinale = repFait;
    }

    // 3. Compréhension : entités + intention (avec résolution de suivi de contexte)
    if (!reponseFinale) {
      var entites = extraireEntites(texte, appData);
      var classification = classifierIntention(texte);
      var intentionExplicite = detecterIntentionExplicite(texte, entites);
      var intentionResolue = intentionExplicite || resoudreIntentionAvecContexte(texte, classification, entites, cleSession);
      var confianceEffective = intentionExplicite ? 1 : classification.confiance;

      // 4. Actions explicites (formulations resserrées, ne se déclenchent jamais sur une simple question)
      var action = detecterAction(texte);
      if (action) {
        reponseFinale = reponseAction(action);
      }

      // 5. Mémoire apprise localement — une correction enseignée par
      // l'utilisateur doit toujours l'emporter sur la réponse par défaut la
      // prochaine fois qu'une question proche revient (voir le filtre
      // anti-volatilité dans aube-semantic-cache : les questions chiffrées
      // — combien, salle, matériel... — ne sont jamais mises en cache, donc
      // ceci ne peut jamais entrer en conflit avec les calculs déterministes).
      if (!reponseFinale) reponseFinale = await chercherDansConnaissancesLocales(texte);

      // 6. Guide d'utilisation (nécessite le texte brut, pas seulement l'intention)
      if (!reponseFinale && intentionResolue === 'COMMENT_FAIRE') {
        reponseFinale = chercherGuide(texte);
      }

      // 7. Routage par intention si confiance suffisante
      if (!reponseFinale && confianceEffective >= 0.14) {
        reponseFinale = genererReponsePourIntention(intentionResolue, entites, appData);
      }

      // Mémorise le contexte pour un éventuel suivi ("et pour le bloc B ?") —
      // uniquement pour les intentions où « suivre » a un sens : une
      // salutation ou un remerciement ne doit jamais devenir ce contexte.
      if (INTENTIONS_AVEC_CONTEXTE.indexOf(intentionResolue) !== -1 && confianceEffective >= 0.14) {
        _contexteParSession[cleSession] = { intention: intentionResolue, timestamp: Date.now() };
      }

      // 7b. Repli : faits personnels enseignés par le créateur (mode EB1 uniquement)
      if (!reponseFinale && estCreateur) reponseFinale = await chercherFaitEB1(texte);

      // 8. Repli : bibliothèque de documents importés
      if (!reponseFinale) reponseFinale = await chercherDansBibliotheque(texte);

      // 9. Repli : guide d'utilisation par mots-clés (au cas où l'intention n'a pas été détectée comme telle)
      if (!reponseFinale) reponseFinale = chercherGuide(texte);

      // 10. Repli final honnête — jamais une phrase générique déguisée en réponse précise
      if (!reponseFinale) {
        reponseFinale = genererReponseInconnue(texte);
        try { await enregistrerLacune(texte, estCreateur ? 'mode_createur' : 'standard'); } catch (e) { /* silencieux */ }
      }
    }
  } catch (e) {
    reponseFinale = 'Je rencontre une petite difficulté technique pour traiter ça — réessayez en reformulant.';
  }

  _dernierEchangeParSession[cleSession] = { question: texte, reponse: reponseFinale };

  await diffuserTexte(reponseFinale, onToken);
  return reponseFinale;
}

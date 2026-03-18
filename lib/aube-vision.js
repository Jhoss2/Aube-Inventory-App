// lib/aube-vision.js
// Reconnaissance visuelle offline — analyse description et trouve les salles

import * as ImagePicker from 'expo-image-picker';

// Mots-cles de categories et types de materiels
var KEYWORDS = {
  chaise:      ['chaise', 'siege', 'assise', 'tabouret'],
  table:       ['table', 'bureau', 'pupitre', 'plan de travail'],
  projecteur:  ['projecteur', 'videoprojecteur', 'beamer', 'ecran'],
  ordinateur:  ['ordinateur', 'pc', 'laptop', 'portable', 'ecran', 'moniteur'],
  tableau:     ['tableau', 'ardoise', 'whiteboard'],
  imprimante:  ['imprimante', 'scanner', 'photocopieuse'],
  armoire:     ['armoire', 'placard', 'etagere', 'rayonnage'],
  climatiseur: ['climatiseur', 'clim', 'ventilateur', 'chauffage'],
  telephone:   ['telephone', 'tel', 'fixe'],
};

// Extrait les mots-cles d'une description texte
function extraireMots(texte) {
  if (!texte) return [];
  var t = texte.toLowerCase();
  var found = [];
  var cats = Object.keys(KEYWORDS);
  for (var i = 0; i < cats.length; i++) {
    var synonymes = KEYWORDS[cats[i]];
    for (var j = 0; j < synonymes.length; j++) {
      if (t.indexOf(synonymes[j]) !== -1) {
        found.push(cats[i]);
        break;
      }
    }
  }
  // Aussi extraire les mots individuels de 4+ lettres
  var mots = t.split(/\s+/);
  for (var k = 0; k < mots.length; k++) {
    if (mots[k].length >= 4) found.push(mots[k]);
  }
  return found;
}

// Score de correspondance entre une description et un materiel
function scorer(description, materiel) {
  var mots = extraireMots(description);
  var score = 0;
  var nom = (materiel.nom || '').toLowerCase();
  var cat = (materiel.category || '').toLowerCase();
  var marque = (materiel.marque || '').toLowerCase();
  var couleur = (materiel.couleur || '').toLowerCase();

  for (var i = 0; i < mots.length; i++) {
    var m = mots[i];
    if (nom.indexOf(m) !== -1) score += 3;
    if (cat.indexOf(m) !== -1) score += 2;
    if (marque.indexOf(m) !== -1) score += 2;
    if (couleur.indexOf(m) !== -1) score += 1;
  }
  return score;
}

// Recherche principale : description textuelle → salles correspondantes
export function rechercherParDescription(description, materiels, salles) {
  if (!description || !materiels || materiels.length === 0) return [];

  var resultats = [];

  for (var i = 0; i < materiels.length; i++) {
    var mat = materiels[i];
    var s = scorer(description, mat);
    if (s > 0) {
      var salle = null;
      for (var j = 0; j < salles.length; j++) {
        if (String(salles[j].id) === String(mat.roomId)) {
          salle = salles[j];
          break;
        }
      }
      resultats.push({
        materiel: mat,
        salle: salle,
        score: s,
      });
    }
  }

  // Trier par score decroissant
  resultats.sort(function(a, b) { return b.score - a.score; });

  // Regrouper par salle
  var parSalle = {};
  for (var r = 0; r < resultats.length; r++) {
    var res = resultats[r];
    var salleId = res.salle ? String(res.salle.id) : 'inconnu';
    if (!parSalle[salleId]) {
      parSalle[salleId] = {
        salle: res.salle,
        materiels: [],
        scoreTotal: 0,
      };
    }
    parSalle[salleId].materiels.push(res.materiel);
    parSalle[salleId].scoreTotal += res.score;
  }

  var groupes = [];
  var keys = Object.keys(parSalle);
  for (var ki = 0; ki < keys.length; ki++) {
    groupes.push(parSalle[keys[ki]]);
  }
  groupes.sort(function(a, b) { return b.scoreTotal - a.scoreTotal; });

  return groupes.slice(0, 5); // Top 5 salles
}

// Formate le resultat pour Aube
export function formaterResultats(groupes) {
  if (!groupes || groupes.length === 0) {
    return 'Je ne trouve aucun materiel correspondant a cette description dans la base de donnees.';
  }

  var rep = 'Voici les salles ou ce type de materiel est present :\n\n';
  for (var i = 0; i < groupes.length; i++) {
    var g = groupes[i];
    var salleNom = g.salle ? (g.salle.name || 'Salle ' + g.salle.id) : 'Salle inconnue';
    rep += '  ' + (i + 1) + '. ' + salleNom;
    if (g.salle && g.salle.blockId) rep += ' (Bloc ' + g.salle.blockId + ')';
    rep += ' — ' + g.materiels.length + ' element(s)';
    if (g.materiels.length > 0 && g.materiels.length <= 3) {
      var noms = [];
      for (var j = 0; j < g.materiels.length; j++) {
        noms.push(g.materiels[j].nom || '?');
      }
      rep += ' : ' + noms.join(', ');
    }
    rep += '\n';
  }
  return rep;
}

// Ouvre la camera pour prendre une photo et retourne la description a analyser
export async function ouvrirCamera() {
  var perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;

  var result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 0.7,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

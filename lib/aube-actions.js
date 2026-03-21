// lib/aube-actions.js
// Cerveau opérationnel d'Aube — elle manipule TOUT son biotope
// PDF, rapports, matériels, salles, notes, notifications, statistiques

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';

// ── Helpers ───────────────────────────────────────────────────────────────────

function norm(t) {
  return (t || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function fmt(v) { return (v !== undefined && v !== null && v !== '') ? String(v) : ''; }

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch(e) { return fmt(iso); }
}

function scoresSante(materiels) {
  if (!materiels || materiels.length === 0) return 100;
  var sain = 0;
  for (var i = 0; i < materiels.length; i++) {
    var e = (materiels[i].etat || '').toUpperCase();
    if (e === 'NEUF' || e === 'BON' || e === 'BON ETAT') sain++;
  }
  return Math.round((sain / materiels.length) * 100);
}

// ── Detecteur d'intentions ────────────────────────────────────────────────────

export function detecterIntentionAction(texte) {
  var t = norm(texte);

  // PDF / Téléchargement
  if (contient(t, ['telecharge', 'pdf', 'genere', 'exporte', 'imprimer', 'importe'])) {
    if (contient(t, ['salle', 'classe', 'bureau', 'local'])) return 'PDF_SALLES';
    if (contient(t, ['rapport', 'bilan', 'synthese', 'inventaire'])) return 'RAPPORT_PDF';
  }

  // Rapport textuel
  if (contient(t, ['rapport', 'bilan', 'synthese', 'redige', 'etat general', 'analyse'])) return 'RAPPORT_TEXTE';

  // Notification à M. Belem
  if (contient(t, ['belem', 'createur', 'monsieur', 'ebenezer', 'notifie', 'message', 'envoie', 'invite'])) return 'NOTIF_CREATEUR';

  // Matériels
  if (contient(t, ['ajoute', 'cree', 'nouveau']) && contient(t, ['materiel', 'equipement', 'fourniture'])) return 'CREATE_MATERIEL';
  if (contient(t, ['modifie', 'change', 'mets a jour', 'actualise']) && contient(t, ['materiel', 'etat', 'equipement'])) return 'UPDATE_MATERIEL';
  if (contient(t, ['supprime', 'efface', 'retire', 'enleve']) && contient(t, ['materiel', 'equipement'])) return 'DELETE_MATERIEL';

  // Salles
  if ((contient(t, ['cree', 'ajoute', 'nouvelle']) && contient(t, ['salle', 'classe', 'bureau']))) return 'CREATE_ROOM';
  if ((contient(t, ['supprime', 'efface']) && contient(t, ['salle', 'classe']))) return 'DELETE_ROOM';
  if ((contient(t, ['modifie', 'renomme', 'change']) && contient(t, ['salle', 'classe']))) return 'UPDATE_ROOM';

  // Notes
  if (contient(t, ['note', 'notes', 'ecris', 'redige', 'memo']) && !contient(t, ['rapport'])) return 'NOTE';

  // Rappels
  if (contient(t, ['rappel', 'rappelle', 'notifie dans'])) return 'REMIND';

  // Stats
  if (contient(t, ['statistique', 'stat', 'combien', 'total', 'bilan', 'resume'])) return 'STATS';

  return null;
}

function contient(t, mots) {
  for (var i = 0; i < mots.length; i++) {
    if (t.indexOf(mots[i]) !== -1) return true;
  }
  return false;
}

// ── Extraction d'entités ──────────────────────────────────────────────────────

function extraireNomsSalles(texte, salles) {
  var t = norm(texte);
  var trouvees = [];

  // Chercher noms explicites dans la liste des salles
  for (var i = 0; i < salles.length; i++) {
    var sn = norm(salles[i].name || '');
    if (sn.length > 1 && t.indexOf(sn) !== -1) trouvees.push(salles[i]);
  }

  // Chercher numéros de salles mentionnés (06, 07, etc.)
  var numeros = t.match(/salle[s]?\s*(\d+)/g) || [];
  for (var j = 0; j < numeros.length; j++) {
    var num = numeros[j].replace(/salle[s]?\s*/, '').trim();
    for (var k = 0; k < salles.length; k++) {
      var sNorm = norm(salles[k].name || '');
      if (sNorm.indexOf(num) !== -1 && trouvees.indexOf(salles[k]) === -1) {
        trouvees.push(salles[k]);
      }
    }
  }

  return trouvees;
}

function extraireBloc(texte) {
  var t = texte.toUpperCase();
  var m = t.match(/BLOC\s*([A-F])/);
  return m ? m[1] : null;
}

function extraireNomSalle(texte) {
  var patterns = [
    /nom\s*:\s*([^\.,\n]+)/i,
    /nom\s*"([^"]+)"/i,
    /appelee?\s+"?([^",\n]+)"?/i,
    /s['']appelle\s+"?([^",\n]+)"?/i,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = texte.match(patterns[i]);
    if (m && m[1]) return m[1].trim();
  }
  var mS = texte.match(/salle\s+(\w+[\w\s]*?)(?:\s+dans|\s+au|\s+bloc|\.|,|$)/i);
  if (mS && mS[1]) return ('Salle ' + mS[1]).trim();
  return null;
}

// ── Générateur HTML PDF (réutilise la logique de SideBar) ─────────────────────

function orangeBtn(label, width) {
  return '<th style="width:' + width + ';padding:6px 4px;border:none;background:transparent;">' +
    '<div style="background:linear-gradient(180deg,#ff9a3c 0%,#e85d04 40%,#c44b02 70%,#ff7a1a 100%);' +
    'border-radius:50px;padding:8px 6px;text-align:center;' +
    'font-family:Georgia,serif;font-size:11px;font-weight:900;font-style:italic;color:white;' +
    'box-shadow:0 4px 0 #8B2500,0 6px 12px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,220,150,0.6);' +
    'border:1px solid rgba(255,160,60,0.4);">' + label + '</div></th>';
}

function glassCell(value, width) {
  var display = value || '&nbsp;';
  return '<td style="width:' + width + ';padding:4px;border:none;background:transparent;">' +
    '<div style="background:linear-gradient(135deg,rgba(255,255,255,0.95),rgba(220,235,255,0.85));' +
    'border-radius:50px;padding:7px 10px;text-align:center;' +
    'font-family:Georgia,serif;font-size:10px;font-weight:900;font-style:italic;color:#1a1a3a;' +
    'box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 2px 8px rgba(100,130,200,0.25);' +
    'border:1px solid rgba(200,215,255,0.6);min-height:28px;display:flex;align-items:center;justify-content:center;">' +
    display + '</div></td>';
}

function buildPdfHtml(room, materiels) {
  var items = materiels.filter(function(m) { return String(m.roomId) === String(room.id); });
  var roomName = room.name ? room.name.charAt(0).toUpperCase() + room.name.slice(1).toLowerCase() : String(room.id);
  var today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  var cols = [
    { label: 'Catégorie', w: '12%' }, { label: 'Nom', w: '12%' }, { label: 'Marque', w: '9%' },
    { label: 'Couleur', w: '7%' }, { label: 'Quantité', w: '7%' }, { label: 'Etat', w: '8%' },
    { label: 'D.A', w: '12%' }, { label: 'D.D.V', w: '12%' }, { label: 'D.R', w: '12%' }, { label: 'Image', w: '9%' },
  ];

  var headerCells = cols.map(function(c) { return orangeBtn(c.label, c.w); }).join('');

  var dataRows = items.length === 0
    ? '<tr><td colspan="10" style="padding:20px;text-align:center;font-family:Georgia,serif;font-style:italic;color:rgba(255,255,255,0.6);">Aucun matériel enregistré.</td></tr>'
    : items.map(function(item) {
        var imgCell = item.image
          ? '<td style="width:11%;padding:4px;border:none;background:transparent;"><div style="background:linear-gradient(135deg,rgba(255,255,255,0.95),rgba(220,235,255,0.85));border-radius:16px;padding:4px;border:1px solid rgba(200,215,255,0.6);"><img src="' + item.image + '" style="width:100%;height:36px;object-fit:cover;border-radius:12px;display:block;"/></div></td>'
          : glassCell('—', '11%');
        return '<tr>' +
          glassCell(fmt(item.category), '12%') + glassCell(fmt(item.nom), '13%') +
          glassCell(fmt(item.marque), '10%') + glassCell(fmt(item.couleur), '8%') +
          glassCell(fmt(item.quantite), '7%') + glassCell(fmt(item.etat), '9%') +
          glassCell(fmtDate(item.dateAcquisition), '10%') + glassCell(fmtDate(item.dateVerification), '10%') +
          glassCell(fmtDate(item.dateRenouvellement), '10%') + imgCell + '</tr>';
      }).join('');

  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>' +
    '<style>@page{size:A4 landscape;margin:16px;}*{box-sizing:border-box;margin:0;padding:0;}' +
    'body{background:#0a0f2e;min-height:100vh;padding:20px 24px;font-family:Georgia,serif;}' +
    'table{width:100%;border-collapse:separate;border-spacing:0 5px;}</style></head><body>' +
    '<div style="text-align:center;"><div style="display:inline-block;background:linear-gradient(180deg,#ff9a3c 0%,#e85d04 40%,#c44b02 70%,#ff7a1a 100%);border-radius:50px;padding:12px 40px;font-family:Georgia,serif;font-size:18px;font-weight:900;font-style:italic;color:white;box-shadow:0 5px 0 #8B2500,0 8px 16px rgba(0,0,0,0.5);margin-bottom:22px;">Liste du matériel — ' + roomName + '</div></div>' +
    '<table><thead><tr>' + headerCells + '</tr></thead><tbody>' + dataRows + '</tbody></table>' +
    '<div style="text-align:center;margin-top:18px;font-family:Georgia,serif;font-style:italic;font-size:10px;color:rgba(255,255,255,0.45);">· U-Auben Supplies Tracker · ' + today + ' ·</div>' +
    '</body></html>';
}

// ── Rapport professionnel HTML ────────────────────────────────────────────────

function buildRapportHtml(appData) {
  var salles = (appData && appData.salles) || [];
  var materiels = (appData && appData.materiels) || [];
  var today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  var now = new Date(); now.setHours(0,0,0,0);

  // Calculs globaux
  var totalMats = materiels.length;
  var parEtat = { NEUF: 0, BON: 0, USE: 0, PANNE: 0, AUTRE: 0 };
  var alertesEtat = []; var alertesDates = [];
  var parBloc = {};

  for (var i = 0; i < materiels.length; i++) {
    var m = materiels[i];
    var eu = (m.etat || '').toUpperCase().trim();
    if (eu === 'NEUF') parEtat.NEUF++;
    else if (eu === 'BON' || eu === 'BON ETAT') parEtat.BON++;
    else if (eu.indexOf('US') !== -1) { parEtat.USE++; alertesEtat.push(m); }
    else if (eu.indexOf('PANNE') !== -1 || eu.indexOf('ENDOMM') !== -1) { parEtat.PANNE++; alertesEtat.push(m); }
    else parEtat.AUTRE++;

    if (m.dateRenouvellement) {
      try {
        var dr = new Date(m.dateRenouvellement); dr.setHours(0,0,0,0);
        var diff = Math.ceil((dr.getTime() - now.getTime()) / 86400000);
        if (diff <= 30) alertesDates.push({ mat: m, diff: diff });
      } catch(e) {}
    }

    // Par bloc
    var sal = null;
    for (var si = 0; si < salles.length; si++) {
      if (String(salles[si].id) === String(m.roomId)) { sal = salles[si]; break; }
    }
    if (sal && sal.blockId) {
      var bid = String(sal.blockId).toUpperCase();
      if (!parBloc[bid]) parBloc[bid] = { total: 0, neuf: 0, bon: 0, use: 0, panne: 0 };
      parBloc[bid].total++;
      if (eu === 'NEUF') parBloc[bid].neuf++;
      else if (eu === 'BON' || eu === 'BON ETAT') parBloc[bid].bon++;
      else if (eu.indexOf('US') !== -1) parBloc[bid].use++;
      else if (eu.indexOf('PANNE') !== -1 || eu.indexOf('ENDOMM') !== -1) parBloc[bid].panne++;
    }
  }

  var pctSain = totalMats > 0 ? Math.round(((parEtat.NEUF + parEtat.BON) / totalMats) * 100) : 100;
  var scoreGlobal = pctSain >= 80 ? 'EXCELLENT' : pctSain >= 60 ? 'SATISFAISANT' : pctSain >= 40 ? 'PRÉOCCUPANT' : 'CRITIQUE';
  var scoreColor = pctSain >= 80 ? '#059669' : pctSain >= 60 ? '#d97706' : '#dc2626';

  // Lignes par bloc
  var blocsHtml = Object.keys(parBloc).map(function(b) {
    var bl = parBloc[b];
    var sc = bl.total > 0 ? Math.round(((bl.neuf + bl.bon) / bl.total) * 100) : 100;
    var col = sc >= 75 ? '#059669' : sc >= 50 ? '#d97706' : '#dc2626';
    return '<tr style="border-bottom:1px solid #eee;">' +
      '<td style="padding:10px;font-weight:900;font-style:italic;font-family:Georgia,serif;">BLOC ' + b + '</td>' +
      '<td style="padding:10px;text-align:center;">' + bl.total + '</td>' +
      '<td style="padding:10px;text-align:center;color:#059669;">' + bl.neuf + '</td>' +
      '<td style="padding:10px;text-align:center;color:#1d4ed8;">' + bl.bon + '</td>' +
      '<td style="padding:10px;text-align:center;color:#d97706;">' + bl.use + '</td>' +
      '<td style="padding:10px;text-align:center;color:#dc2626;">' + bl.panne + '</td>' +
      '<td style="padding:10px;text-align:center;font-weight:900;color:' + col + ';">' + sc + '%</td>' +
      '</tr>';
  }).join('');

  // Alertes
  var alertesHtml = alertesEtat.slice(0, 10).map(function(m) {
    var s = null;
    for (var si = 0; si < salles.length; si++) {
      if (String(salles[si].id) === String(m.roomId)) { s = salles[si]; break; }
    }
    return '<li style="margin-bottom:6px;"><strong>' + fmt(m.nom) + '</strong> — ' +
      fmt(m.etat) + ' — ' + (s ? s.name : '?') +
      (m.infos ? ' — <em>' + m.infos + '</em>' : '') + '</li>';
  }).join('');

  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>' +
    '<style>body{font-family:Georgia,"Times New Roman",serif;color:#1a1a3a;background:#fff;padding:40px;margin:0;}' +
    'h1{font-size:28px;color:#8B0000;border-bottom:3px solid #8B0000;padding-bottom:10px;margin-bottom:6px;}' +
    'h2{font-size:18px;color:#1A237E;margin-top:32px;margin-bottom:12px;border-left:4px solid #8B0000;padding-left:12px;}' +
    'table{width:100%;border-collapse:collapse;margin-bottom:20px;}' +
    'th{background:#8B0000;color:white;padding:10px;font-style:italic;}' +
    'td{padding:10px;border-bottom:1px solid #eee;}' +
    '.badge{display:inline-block;padding:4px 14px;border-radius:20px;font-weight:900;font-size:16px;color:white;background:' + scoreColor + ';}' +
    '.section{background:#f8f8ff;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e0e0f0;}' +
    '</style></head><body>' +

    '<div style="text-align:center;margin-bottom:30px;">' +
    '<h1>RAPPORT GÉNÉRAL D\'INVENTAIRE</h1>' +
    '<p style="font-style:italic;color:#666;">Université Aube Nouvelle · Généré par Aube le ' + today + '</p>' +
    '</div>' +

    '<div class="section">' +
    '<h2>Vue d\'ensemble</h2>' +
    '<table><tr>' +
    '<td style="text-align:center;"><strong style="font-size:32px;color:#8B0000;">' + salles.length + '</strong><br/>Salles</td>' +
    '<td style="text-align:center;"><strong style="font-size:32px;color:#1A237E;">' + totalMats + '</strong><br/>Matériels</td>' +
    '<td style="text-align:center;"><strong style="font-size:32px;color:#059669;">' + parEtat.NEUF + '</strong><br/>Neufs</td>' +
    '<td style="text-align:center;"><strong style="font-size:32px;color:#1d4ed8;">' + parEtat.BON + '</strong><br/>Bon état</td>' +
    '<td style="text-align:center;"><strong style="font-size:32px;color:#d97706;">' + parEtat.USE + '</strong><br/>Usés</td>' +
    '<td style="text-align:center;"><strong style="font-size:32px;color:#dc2626;">' + parEtat.PANNE + '</strong><br/>Pannes</td>' +
    '</tr></table>' +
    '<p style="text-align:center;margin-top:16px;">Score de santé global : <span class="badge">' + scoreGlobal + ' (' + pctSain + '%)</span></p>' +
    '</div>' +

    '<h2>Analyse par bloc</h2>' +
    '<table><thead><tr><th>Bloc</th><th>Total</th><th>Neufs</th><th>Bon état</th><th>Usés</th><th>Pannes</th><th>Score santé</th></tr></thead>' +
    '<tbody>' + (blocsHtml || '<tr><td colspan="7" style="text-align:center;">Aucun bloc enregistré</td></tr>') + '</tbody></table>' +

    (alertesEtat.length > 0 ?
    '<h2>Matériels nécessitant une attention (' + alertesEtat.length + ')</h2>' +
    '<div class="section"><ul style="margin:0;padding-left:20px;">' + alertesHtml + '</ul>' +
    (alertesEtat.length > 10 ? '<p style="color:#888;font-style:italic;margin-top:10px;">... et ' + (alertesEtat.length - 10) + ' autre(s)</p>' : '') +
    '</div>' : '') +

    (alertesDates.length > 0 ?
    '<h2>Renouvellements urgents (' + alertesDates.length + ')</h2>' +
    '<div class="section"><ul style="margin:0;padding-left:20px;">' +
    alertesDates.map(function(a) {
      return '<li style="margin-bottom:6px;"><strong>' + fmt(a.mat.nom) + '</strong> — ' +
        (a.diff < 0 ? '<span style="color:#dc2626;">Dépassé de ' + Math.abs(a.diff) + 'j</span>' : '<span style="color:#d97706;">Dans ' + a.diff + 'j</span>') + '</li>';
    }).join('') + '</ul></div>' : '') +

    '<h2>Recommandations d\'Aube</h2>' +
    '<div class="section"><ul style="margin:0;padding-left:20px;">' +
    (parEtat.PANNE > 0 ? '<li>🔴 Réparer ou remplacer les <strong>' + parEtat.PANNE + ' matériel(s) en panne</strong> en priorité absolue.</li>' : '') +
    (parEtat.USE > 2 ? '<li>⚠️ Planifier le remplacement progressif des <strong>' + parEtat.USE + ' matériels usés</strong>.</li>' : '') +
    (alertesDates.filter(function(a) { return a.diff < 0; }).length > 0 ? '<li>❗ <strong>' + alertesDates.filter(function(a) { return a.diff < 0; }).length + ' renouvellement(s) dépassé(s)</strong> — Action immédiate requise.</li>' : '') +
    (pctSain >= 80 ? '<li>✅ L\'inventaire est en <strong>très bonne santé globale</strong>. Maintenir la cadence de maintenance préventive.</li>' : '') +
    '</ul></div>' +

    '<div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;color:#888;font-style:italic;font-size:12px;">' +
    '· Rapport généré automatiquement par Aube — U-Auben Inventory App · Version 1.1.1 ·' +
    '</div></body></html>';
}

// ── ACTIONS PRINCIPALES ───────────────────────────────────────────────────────

// Télécharger PDF d'une ou plusieurs salles
export async function telechargerPdfSalles(nomsSalles, appData) {
  var salles = (appData && appData.salles) || [];
  var materiels = (appData && appData.materiels) || [];

  var sallesCibles = nomsSalles.length > 0 ? nomsSalles : salles;

  if (sallesCibles.length === 0) return 'Aucune salle trouvée dans la base de données.';

  var resultats = [];
  for (var i = 0; i < sallesCibles.length; i++) {
    var room = sallesCibles[i];
    try {
      var html = buildPdfHtml(room, materiels);
      var res = await Print.printToFileAsync({ html: html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(res.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'PDF — ' + (room.name || room.id),
          UTI: 'com.adobe.pdf',
        });
      }
      resultats.push('✅ ' + (room.name || room.id));
    } catch(e) {
      resultats.push('❌ ' + (room.name || room.id) + ' : ' + (e.message || 'Erreur'));
    }
  }

  return 'Téléchargement terminé :\n' + resultats.join('\n');
}

// Générer et télécharger le rapport général
export async function genererRapportPdf(appData) {
  try {
    var html = buildRapportHtml(appData);
    var res = await Print.printToFileAsync({ html: html, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(res.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Rapport Général — U-Auben',
        UTI: 'com.adobe.pdf',
      });
      return '✅ Rapport professionnel généré et téléchargé avec succès !';
    }
    return '✅ Rapport généré : ' + res.uri;
  } catch(e) {
    return '❌ Erreur lors de la génération du rapport : ' + (e.message || e);
  }
}

// Rapport textuel détaillé (dans le chat)
export function genererRapportTexte(appData) {
  var salles = (appData && appData.salles) || [];
  var materiels = (appData && appData.materiels) || [];
  var now = new Date(); now.setHours(0,0,0,0);

  var parEtat = { NEUF: 0, BON: 0, USE: 0, PANNE: 0 };
  var alertes = 0; var depassees = 0;

  for (var i = 0; i < materiels.length; i++) {
    var eu = (materiels[i].etat || '').toUpperCase().trim();
    if (eu === 'NEUF') parEtat.NEUF++;
    else if (eu === 'BON' || eu === 'BON ETAT') parEtat.BON++;
    else if (eu.indexOf('US') !== -1) { parEtat.USE++; alertes++; }
    else if (eu.indexOf('PANNE') !== -1 || eu.indexOf('ENDOMM') !== -1) { parEtat.PANNE++; alertes++; }

    if (materiels[i].dateRenouvellement) {
      try {
        var dr = new Date(materiels[i].dateRenouvellement); dr.setHours(0,0,0,0);
        if (dr.getTime() < now.getTime()) depassees++;
      } catch(e) {}
    }
  }

  var pct = materiels.length > 0 ? Math.round(((parEtat.NEUF + parEtat.BON) / materiels.length) * 100) : 100;
  var emojiSante = pct >= 80 ? '🟢' : pct >= 60 ? '🟡' : '🔴';

  return '📊 RAPPORT GÉNÉRAL — ' + new Date().toLocaleDateString('fr-FR') + '\n\n' +
    '🏫 Salles enregistrées : ' + salles.length + '\n' +
    '📦 Matériels totaux : ' + materiels.length + '\n\n' +
    '📈 État des matériels :\n' +
    '  ✨ Neufs : ' + parEtat.NEUF + '\n' +
    '  👍 Bon état : ' + parEtat.BON + '\n' +
    '  ⚠️ Usés : ' + parEtat.USE + '\n' +
    '  🔴 En panne : ' + parEtat.PANNE + '\n\n' +
    emojiSante + ' Score de santé global : ' + pct + '%\n' +
    '🚨 Alertes actives : ' + alertes + '\n' +
    '❗ Renouvellements dépassés : ' + depassees + '\n\n' +
    (parEtat.PANNE > 0 ? '⚡ Action urgente : ' + parEtat.PANNE + ' panne(s) à traiter.\n' : '') +
    (depassees > 0 ? '⚡ ' + depassees + ' renouvellement(s) dépassé(s).\n' : '') +
    '\nVoulez-vous que je génère le rapport PDF complet ?';
}

// Envoyer une notification à M. Belem
export async function notifierCreateur(message, sujet) {
  try {
    var permResult = await Notifications.requestPermissionsAsync();
    if (permResult.status !== 'granted') {
      return '⚠️ Les permissions de notification ne sont pas accordées. Activez-les dans les paramètres de l\'appareil.';
    }

    var msg = message || 'Aube vous invite à discuter. Elle a des sujets intéressants à aborder !';
    var titreNotif = sujet || '💬 Message d\'Aube pour M. Belem';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: titreNotif,
        body: msg,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'aube_message', timestamp: Date.now() },
      },
      trigger: null, // Immédiat
    });

    return '✅ Message envoyé à Monsieur Belem via la barre de notifications !\n\n📨 "' + msg + '"';
  } catch(e) {
    return '❌ Impossible d\'envoyer la notification : ' + (e.message || e);
  }
}

// Créer un matériel
export function creerMateriel(texte, appData, appContext) {
  if (!appContext || !appContext.addMateriel) return 'Impossible d\'accéder aux données.';
  var salles = (appData && appData.salles) || [];

  // Extraction basique
  var nomM = null;
  var mNom = texte.match(/nom\s*:\s*([^\.,\n]+)/i);
  if (mNom) nomM = mNom[1].trim();

  var salleCible = null;
  for (var i = 0; i < salles.length; i++) {
    if (norm(texte).indexOf(norm(salles[i].name)) !== -1) { salleCible = salles[i]; break; }
  }

  if (!nomM) return 'Précisez le nom du matériel. Exemple : "Ajoute un matériel. Nom : Chaise bleue"';
  if (!salleCible) return 'Précisez la salle concernée.';

  var categorie = 'Mobilier';
  if (norm(texte).indexOf('bureautique') !== -1) categorie = 'Bureautique';
  else if (norm(texte).indexOf('pedagogique') !== -1) categorie = 'Pédagogique';
  else if (norm(texte).indexOf('informatique') !== -1) categorie = 'Informatique';

  appContext.addMateriel({
    id: 'mat-' + Date.now(),
    roomId: salleCible.id,
    nom: nomM,
    category: categorie,
    quantite: '1',
    etat: 'NEUF',
    createdAt: new Date().toISOString(),
  });

  return '✅ Matériel "' + nomM + '" ajouté dans "' + salleCible.name + '" (catégorie : ' + categorie + ', état : NEUF).';
}

// ── Dispatcher principal ──────────────────────────────────────────────────────

export async function executerActionComplete(intention, texte, appData, appContext) {
  var salles = (appData && appData.salles) || [];

  if (intention === 'PDF_SALLES') {
    var sallesCibles = extraireNomsSalles(texte, salles);
    if (sallesCibles.length === 0) {
      // Chercher par numéros génériques
      var nums = texte.match(/\d+/g) || [];
      for (var ni = 0; ni < nums.length; ni++) {
        for (var si = 0; si < salles.length; si++) {
          if (norm(salles[si].name).indexOf(nums[ni]) !== -1 && sallesCibles.indexOf(salles[si]) === -1) {
            sallesCibles.push(salles[si]);
          }
        }
      }
    }
    if (sallesCibles.length === 0) return 'Je n\'ai pas trouvé les salles mentionnées. Précisez les noms ou numéros.';
    return await telechargerPdfSalles(sallesCibles, appData);
  }

  if (intention === 'RAPPORT_PDF') return await genererRapportPdf(appData);
  if (intention === 'RAPPORT_TEXTE') return genererRapportTexte(appData);

  if (intention === 'NOTIF_CREATEUR') {
    var t = norm(texte);
    var sujetDetecte = null;
    if (t.indexOf('invite') !== -1 || t.indexOf('invitation') !== -1) {
      sujetDetecte = '💬 Invitation d\'Aube — ' + new Date().toLocaleDateString('fr-FR');
    }
    var msgDetecte = null;
    var mMsg = texte.match(/message\s*:\s*([^\n]+)/i);
    if (mMsg) msgDetecte = mMsg[1].trim();
    return await notifierCreateur(msgDetecte, sujetDetecte);
  }

  if (intention === 'CREATE_MATERIEL') return creerMateriel(texte, appData, appContext);

  if (intention === 'CREATE_ROOM') {
    if (!appContext || !appContext.addSalle) return 'Impossible d\'accéder aux données.';
    var nomSalle = extraireNomSalle(texte);
    var blocId = extraireBloc(texte);
    if (!nomSalle) return 'Précisez le nom de la salle. Exemple : "Nom : Salle 06"';
    if (!blocId) return 'Précisez le bloc. Exemple : "dans le bloc B"';
    appContext.addSalle({ id: 'salle-' + Date.now(), name: nomSalle, blockId: blocId, level: 'Niveau 1', image: null, createdAt: new Date().toISOString() });
    return '✅ Salle "' + nomSalle + '" créée dans le Bloc ' + blocId + ' !';
  }

  if (intention === 'DELETE_ROOM') {
    if (!appContext || !appContext.deleteRoom) return 'Impossible d\'accéder aux données.';
    var cibles = extraireNomsSalles(texte, salles);
    if (cibles.length === 0) return 'Salle introuvable. Précisez le nom exact.';
    appContext.deleteRoom(cibles[0].id);
    return '🗑️ Salle "' + cibles[0].name + '" supprimée.';
  }

  if (intention === 'UPDATE_ROOM') {
    if (!appContext || !appContext.updateSalle) return 'Impossible d\'accéder aux données.';
    var ciblesU = extraireNomsSalles(texte, salles);
    var nouveauNom = extraireNomSalle(texte);
    if (ciblesU.length === 0) return 'Salle introuvable.';
    if (!nouveauNom) return 'Précisez le nouveau nom.';
    appContext.updateSalle(ciblesU[0].id, { name: nouveauNom });
    return '✅ Salle "' + ciblesU[0].name + '" renommée en "' + nouveauNom + '".';
  }

  if (intention === 'STATS') return genererRapportTexte(appData);

  return null;
}

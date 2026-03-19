// lib/aube-reasoning-engine.js
// Moteur de raisonnement local d'Aube — calcule sur les vraies donnees

// ── Normalisation ─────────────────────────────────────────────────────────────

function norm(t) {
  return (t || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function contient(t, mots) {
  for (var i = 0; i < mots.length; i++) {
    if (t.indexOf(mots[i]) !== -1) return true;
  }
  return false;
}

// ── Analyseur d'intentions ────────────────────────────────────────────────────

function analyserIntention(texte) {
  var t = norm(texte);
  var intentions = [];

  // INTENTIONS STATISTIQUES
  if (contient(t, ['combien', 'nombre', 'total', 'count', 'quantite', 'stats', 'statistique', 'bilan', 'resume', 'apercu', 'vue d ensemble', 'etat des lieux', 'situation'])) {
    intentions.push('STATS');
  }

  // INTENTIONS COMPARAISON
  if (contient(t, ['compare', 'comparer', 'comparaison', 'difference', 'versus', 'vs', 'entre', 'par rapport', 'mieux', 'pire', 'plus', 'moins', 'meilleur', 'moins bon'])) {
    intentions.push('COMPARE');
  }

  // INTENTIONS CLASSEMENT
  if (contient(t, ['plus', 'moins', 'mieux', 'pire', 'meilleur', 'premier', 'derniere', 'top', 'rang', 'classement', 'trier', 'ordre', 'priorite', 'urgent', 'critique'])) {
    intentions.push('RANK');
  }

  // INTENTIONS LOCALISATION
  if (contient(t, ['ou', 'salle', 'bloc', 'niveau', 'localiser', 'trouver', 'chercher', 'endroit', 'emplacement', 'dans quel', 'se trouve', 'location'])) {
    intentions.push('LOCATE');
  }

  // INTENTIONS TEMPORELLES
  if (contient(t, ['quand', 'date', 'bientot', 'prochainement', 'urgent', 'expire', 'perime', 'renouveler', 'renouvellement', 'depasse', 'calendrier', 'planning', 'echeance'])) {
    intentions.push('TEMPORAL');
  }

  // INTENTIONS ETAT
  if (contient(t, ['etat', 'condition', 'neuf', 'bon', 'use', 'panne', 'endommage', 'casse', 'deteriore', 'abime', 'fonctionnel', 'hors service', 'operationnel'])) {
    intentions.push('ETAT');
  }

  // INTENTIONS CATEGORIE
  if (contient(t, ['categorie', 'type', 'sorte', 'genre', 'fourniture', 'pedagogique', 'bureautique', 'logistique', 'verdure', 'nettoyage', 'mobilier'])) {
    intentions.push('CATEGORIE');
  }

  // INTENTIONS RECOMMANDATION
  if (contient(t, ['conseil', 'recommande', 'suggere', 'que faire', 'que dois', 'quoi faire', 'faut il', 'devrais', 'devrait', 'que devrais', 'action', 'priorite'])) {
    intentions.push('RECOMMEND');
  }

  // INTENTIONS ANALYSE TENDANCE
  if (contient(t, ['tendance', 'evolution', 'progression', 'deterioration', 'amelioration', 'historique', 'au fil', 'au cours', 'analyse', 'rapport'])) {
    intentions.push('TENDANCE');
  }

  return intentions;
}

// ── Extraction d'entites ──────────────────────────────────────────────────────

function extraireEntites(texte, appData) {
  var t = norm(texte);
  var salles = (appData && appData.salles) || [];
  var entites = { salles: [], blocs: [], categories: [], etats: [] };

  // Blocs mentionnes
  var blocs = ['a', 'b', 'c', 'd', 'e', 'f'];
  for (var bi = 0; bi < blocs.length; bi++) {
    if (t.indexOf('bloc ' + blocs[bi]) !== -1 || t.indexOf('block ' + blocs[bi]) !== -1) {
      entites.blocs.push(blocs[bi].toUpperCase());
    }
  }

  // Salles mentionnees
  for (var si = 0; si < salles.length; si++) {
    var sn = norm(salles[si].name || '');
    if (sn.length > 1 && t.indexOf(sn) !== -1) {
      entites.salles.push(salles[si]);
    }
  }

  // Categories mentionnees
  var cats = ['bureautique', 'pedagogique', 'logistique', 'verdure', 'nettoyage', 'mobilier', 'informatique', 'audiovisuel'];
  for (var ci = 0; ci < cats.length; ci++) {
    if (t.indexOf(cats[ci]) !== -1) entites.categories.push(cats[ci]);
  }

  // Etats mentionnes
  if (contient(t, ['neuf', 'nouveau', 'recente'])) entites.etats.push('NEUF');
  if (contient(t, ['bon', 'correct', 'bien'])) entites.etats.push('BON');
  if (contient(t, ['use', 'vieux', 'ancien', 'deteriore', 'abime'])) entites.etats.push('USE');
  if (contient(t, ['panne', 'casse', 'endommage', 'hors service', 'ne fonctionne'])) entites.etats.push('PANNE');

  return entites;
}

// ── Calculateurs ──────────────────────────────────────────────────────────────

function calculerStatsGlobales(appData) {
  var salles = (appData && appData.salles) || [];
  var materiels = (appData && appData.materiels) || [];
  var now = new Date(); now.setHours(0,0,0,0);

  var stats = {
    totalSalles: salles.length,
    totalMateriels: materiels.length,
    parEtat: { NEUF: 0, BON: 0, USE: 0, PANNE: 0, AUTRE: 0 },
    parBloc: {},
    alertesEtat: 0,
    alertesDate: 0,
    alertesDepassees: 0,
    alertesImminentes: 0,
    valeurTotaleQuantite: 0,
  };

  for (var mi = 0; mi < materiels.length; mi++) {
    var m = materiels[mi];
    var eu = (m.etat || '').toUpperCase().trim();
    stats.valeurTotaleQuantite += parseInt(m.quantite) || 0;

    if (eu === 'NEUF') stats.parEtat.NEUF++;
    else if (eu === 'BON' || eu === 'BON ETAT') stats.parEtat.BON++;
    else if (eu.indexOf('US') !== -1) { stats.parEtat.USE++; stats.alertesEtat++; }
    else if (eu.indexOf('PANNE') !== -1 || eu.indexOf('ENDOMM') !== -1 || eu === 'DAMAGED') { stats.parEtat.PANNE++; stats.alertesEtat++; }
    else stats.parEtat.AUTRE++;

    // Par bloc
    var salle = null;
    for (var si = 0; si < salles.length; si++) {
      if (String(salles[si].id) === String(m.roomId)) { salle = salles[si]; break; }
    }
    if (salle && salle.blockId) {
      var bid = String(salle.blockId).toUpperCase();
      if (!stats.parBloc[bid]) stats.parBloc[bid] = { total: 0, neuf: 0, bon: 0, use: 0, panne: 0, salles: {} };
      stats.parBloc[bid].total++;
      if (eu === 'NEUF') stats.parBloc[bid].neuf++;
      else if (eu === 'BON' || eu === 'BON ETAT') stats.parBloc[bid].bon++;
      else if (eu.indexOf('US') !== -1) stats.parBloc[bid].use++;
      else if (eu.indexOf('PANNE') !== -1 || eu.indexOf('ENDOMM') !== -1) stats.parBloc[bid].panne++;
      if (!stats.parBloc[bid].salles[String(salle.id)]) stats.parBloc[bid].salles[String(salle.id)] = salle.name;
    }

    // Dates
    if (m.dateRenouvellement) {
      try {
        var dr = new Date(m.dateRenouvellement); dr.setHours(0,0,0,0);
        var diff = Math.ceil((dr.getTime() - now.getTime()) / 86400000);
        if (diff < 0) { stats.alertesDepassees++; stats.alertesDate++; }
        else if (diff <= 30) { stats.alertesImminentes++; stats.alertesDate++; }
      } catch(e) {}
    }
  }

  return stats;
}

function calculerStatsSalle(salle, appData) {
  var materiels = (appData && appData.materiels) || [];
  var items = materiels.filter(function(m) { return String(m.roomId) === String(salle.id); });
  var now = new Date(); now.setHours(0,0,0,0);

  var stats = { nom: salle.name, bloc: salle.blockId, niveau: salle.level, total: items.length, parEtat: { NEUF: 0, BON: 0, USE: 0, PANNE: 0 }, alertes: 0, parCategorie: {} };

  for (var i = 0; i < items.length; i++) {
    var m = items[i];
    var eu = (m.etat || '').toUpperCase().trim();
    if (eu === 'NEUF') stats.parEtat.NEUF++;
    else if (eu === 'BON' || eu === 'BON ETAT') stats.parEtat.BON++;
    else if (eu.indexOf('US') !== -1) { stats.parEtat.USE++; stats.alertes++; }
    else if (eu.indexOf('PANNE') !== -1 || eu.indexOf('ENDOMM') !== -1) { stats.parEtat.PANNE++; stats.alertes++; }

    var cat = (m.category || 'Autre').toUpperCase();
    stats.parCategorie[cat] = (stats.parCategorie[cat] || 0) + 1;

    if (m.dateRenouvellement) {
      try {
        var dr = new Date(m.dateRenouvellement); dr.setHours(0,0,0,0);
        var diff = Math.ceil((dr.getTime() - now.getTime()) / 86400000);
        if (diff < 0 || diff <= 30) stats.alertes++;
      } catch(e) {}
    }
  }

  stats.scoresSante = Math.round(((stats.parEtat.NEUF * 100 + stats.parEtat.BON * 75) / Math.max(stats.total, 1)));
  return stats;
}

function scoresSanteBloc(blocId, appData) {
  var salles = (appData && appData.salles) || [];
  var sallesBloc = salles.filter(function(s) { return String(s.blockId).toUpperCase() === String(blocId).toUpperCase(); });
  var total = 0; var sain = 0;
  var materiels = (appData && appData.materiels) || [];
  for (var si = 0; si < sallesBloc.length; si++) {
    var items = materiels.filter(function(m) { return String(m.roomId) === String(sallesBloc[si].id); });
    for (var ii = 0; ii < items.length; ii++) {
      total++;
      var eu = (items[ii].etat || '').toUpperCase();
      if (eu === 'NEUF' || eu === 'BON' || eu === 'BON ETAT') sain++;
    }
  }
  return total > 0 ? Math.round((sain / total) * 100) : 100;
}

// ── Generateurs de reponses ───────────────────────────────────────────────────

function genererReponseStats(appData) {
  var s = calculerStatsGlobales(appData);
  var pctNeuf = s.totalMateriels > 0 ? Math.round((s.parEtat.NEUF / s.totalMateriels) * 100) : 0;
  var pctPanne = s.totalMateriels > 0 ? Math.round(((s.parEtat.PANNE + s.parEtat.USE) / s.totalMateriels) * 100) : 0;

  var rep = 'Voici le bilan complet de l\'inventaire :\n\n';
  rep += '🏫 Salles enregistrées : ' + s.totalSalles + '\n';
  rep += '📦 Matériels au total : ' + s.totalMateriels + '\n';
  rep += '📊 Quantité totale d\'unités : ' + s.valeurTotaleQuantite + '\n\n';
  rep += '📈 État des matériels :\n';
  rep += '   ✨ Neufs : ' + s.parEtat.NEUF + ' (' + pctNeuf + '%)\n';
  rep += '   👍 Bon état : ' + s.parEtat.BON + '\n';
  rep += '   ⚠️ Usés : ' + s.parEtat.USE + '\n';
  rep += '   🔴 En panne : ' + s.parEtat.PANNE + '\n\n';
  rep += '🚨 Alertes actives : ' + (s.alertesEtat + s.alertesDate) + '\n';
  if (s.alertesDepassees > 0) rep += '   ❗ Renouvellements dépassés : ' + s.alertesDepassees + '\n';
  if (s.alertesImminentes > 0) rep += '   ⏰ Renouvellements imminents (30j) : ' + s.alertesImminentes + '\n';

  if (pctPanne > 30) rep += '\n💡 Recommandation : ' + pctPanne + '% des matériels nécessitent une attention urgente.';
  else if (pctNeuf > 60) rep += '\n✅ L\'inventaire est en très bonne santé globalement.';

  return rep;
}

function genererReponseClassementBlocs(appData) {
  var s = calculerStatsGlobales(appData);
  var blocs = Object.keys(s.parBloc);
  if (blocs.length === 0) return 'Aucun bloc enregistré dans la base de données.';

  blocs.sort(function(a, b) { return (s.parBloc[b].panne + s.parBloc[b].use) - (s.parBloc[a].panne + s.parBloc[a].use); });

  var rep = 'Classement des blocs par niveau de dégradation :\n\n';
  for (var i = 0; i < blocs.length; i++) {
    var b = s.parBloc[blocs[i]];
    var score = scoresSanteBloc(blocs[i], appData);
    var emoji = score > 75 ? '🟢' : score > 50 ? '🟡' : '🔴';
    rep += emoji + ' Bloc ' + blocs[i] + ' — Score de santé : ' + score + '%\n';
    rep += '   Total : ' + b.total + ' matériels | Neufs : ' + b.neuf + ' | Usés : ' + b.use + ' | Pannes : ' + b.panne + '\n';
    rep += '   Salles : ' + Object.values(b.salles).slice(0, 3).join(', ') + (Object.keys(b.salles).length > 3 ? '...' : '') + '\n\n';
  }
  return rep;
}

function genererReponseCalendrier(appData) {
  var materiels = (appData && appData.materiels) || [];
  var salles = (appData && appData.salles) || [];
  var now = new Date(); now.setHours(0,0,0,0);

  var urgents = []; var proches = []; var depasses = [];

  for (var i = 0; i < materiels.length; i++) {
    var m = materiels[i];
    if (!m.dateRenouvellement) continue;
    try {
      var dr = new Date(m.dateRenouvellement); dr.setHours(0,0,0,0);
      var diff = Math.ceil((dr.getTime() - now.getTime()) / 86400000);
      var sal = null;
      for (var si = 0; si < salles.length; si++) {
        if (String(salles[si].id) === String(m.roomId)) { sal = salles[si]; break; }
      }
      var nom = (m.nom || '?') + (sal ? ' (' + sal.name + ')' : '');
      if (diff < 0) depasses.push({ nom: nom, diff: Math.abs(diff) });
      else if (diff <= 7) urgents.push({ nom: nom, diff: diff });
      else if (diff <= 30) proches.push({ nom: nom, diff: diff });
    } catch(e) {}
  }

  if (depasses.length === 0 && urgents.length === 0 && proches.length === 0) {
    return 'Excellente nouvelle ! Aucun renouvellement urgent ou dépassé. Tout est à jour.';
  }

  var rep = 'Calendrier des renouvellements :\n\n';
  if (depasses.length > 0) {
    rep += '❗ DÉPASSÉS (' + depasses.length + ') :\n';
    depasses.sort(function(a,b){ return b.diff - a.diff; });
    for (var d = 0; d < Math.min(depasses.length, 5); d++) rep += '   • ' + depasses[d].nom + ' — dépassé de ' + depasses[d].diff + ' jours\n';
    if (depasses.length > 5) rep += '   ... et ' + (depasses.length - 5) + ' autres\n';
    rep += '\n';
  }
  if (urgents.length > 0) {
    rep += '🔴 URGENTS - cette semaine (' + urgents.length + ') :\n';
    urgents.sort(function(a,b){ return a.diff - b.diff; });
    for (var u = 0; u < Math.min(urgents.length, 5); u++) rep += '   • ' + urgents[u].nom + ' — dans ' + urgents[u].diff + ' jours\n';
    rep += '\n';
  }
  if (proches.length > 0) {
    rep += '⏰ IMMINENTS - ce mois (' + proches.length + ') :\n';
    proches.sort(function(a,b){ return a.diff - b.diff; });
    for (var p = 0; p < Math.min(proches.length, 5); p++) rep += '   • ' + proches[p].nom + ' — dans ' + proches[p].diff + ' jours\n';
  }
  return rep;
}

function genererReponseComparaison(entites, appData) {
  if (entites.salles.length >= 2) {
    var s1 = calculerStatsSalle(entites.salles[0], appData);
    var s2 = calculerStatsSalle(entites.salles[1], appData);
    var rep = 'Comparaison entre ' + s1.nom + ' et ' + s2.nom + ' :\n\n';
    rep += '📊 ' + s1.nom + ' : ' + s1.total + ' matériels | Score santé : ' + s1.scoresSante + '% | Alertes : ' + s1.alertes + '\n';
    rep += '📊 ' + s2.nom + ' : ' + s2.total + ' matériels | Score santé : ' + s2.scoresSante + '% | Alertes : ' + s2.alertes + '\n\n';
    if (s1.scoresSante > s2.scoresSante) rep += '✅ ' + s1.nom + ' est en meilleur état.';
    else if (s2.scoresSante > s1.scoresSante) rep += '✅ ' + s2.nom + ' est en meilleur état.';
    else rep += '⚖️ Les deux salles sont dans un état similaire.';
    return rep;
  }
  if (entites.blocs.length >= 2) {
    var scores = {};
    for (var bi = 0; bi < entites.blocs.length; bi++) {
      scores[entites.blocs[bi]] = scoresSanteBloc(entites.blocs[bi], appData);
    }
    var rep2 = 'Comparaison des blocs :\n\n';
    for (var bk in scores) {
      var emoji = scores[bk] > 75 ? '🟢' : scores[bk] > 50 ? '🟡' : '🔴';
      rep2 += emoji + ' Bloc ' + bk + ' — Score de santé : ' + scores[bk] + '%\n';
    }
    return rep2;
  }
  return null;
}

function genererReponseRecommandations(appData) {
  var s = calculerStatsGlobales(appData);
  var materiels = (appData && appData.materiels) || [];
  var salles = (appData && appData.salles) || [];
  var recs = [];

  // Recommandations basees sur les donnees reelles
  if (s.alertesDepassees > 0) recs.push('🔴 URGENT : ' + s.alertesDepassees + ' matériel(s) ont dépassé leur date de renouvellement. Agissez maintenant.');
  if (s.alertesImminentes > 0) recs.push('⏰ Planifiez le renouvellement de ' + s.alertesImminentes + ' matériel(s) dans les 30 prochains jours.');
  if (s.parEtat.PANNE > 0) recs.push('🔧 ' + s.parEtat.PANNE + ' matériel(s) en panne nécessitent une réparation ou remplacement urgent.');
  if (s.parEtat.USE > 3) recs.push('⚠️ ' + s.parEtat.USE + ' matériels usés détectés. Envisagez un plan de renouvellement progressif.');

  // Blocs les plus degradés
  var blocs = Object.keys(s.parBloc);
  var blocsDegrades = blocs.filter(function(b) { return scoresSanteBloc(b, appData) < 50; });
  if (blocsDegrades.length > 0) recs.push('🏫 Les blocs ' + blocsDegrades.join(', ') + ' nécessitent une attention particulière (score < 50%).');

  // Salles sans materiels
  var sallesSansMateriels = salles.filter(function(sal) {
    return !materiels.find(function(m) { return String(m.roomId) === String(sal.id); });
  });
  if (sallesSansMateriels.length > 0) recs.push('📋 ' + sallesSansMateriels.length + ' salle(s) n\'ont aucun matériel enregistré. Vérifiez leur inventaire.');

  if (recs.length === 0) return 'Excellent ! Aucune action urgente requise. L\'inventaire est en bonne santé. Continuez la maintenance préventive.';

  var rep = 'Voici mes recommandations basées sur l\'analyse de l\'inventaire :\n\n';
  for (var i = 0; i < recs.length; i++) rep += recs[i] + '\n\n';
  return rep;
}

function genererReponseSalle(salle, appData) {
  var stats = calculerStatsSalle(salle, appData);
  var emoji = stats.scoresSante > 75 ? '🟢' : stats.scoresSante > 50 ? '🟡' : '🔴';
  var rep = emoji + ' Salle "' + stats.nom + '" — Bloc ' + (stats.bloc || '?') + '\n\n';
  rep += '📦 Matériels enregistrés : ' + stats.total + '\n';
  if (stats.total > 0) {
    rep += '📊 États :\n';
    if (stats.parEtat.NEUF > 0) rep += '   ✨ Neufs : ' + stats.parEtat.NEUF + '\n';
    if (stats.parEtat.BON > 0) rep += '   👍 Bon état : ' + stats.parEtat.BON + '\n';
    if (stats.parEtat.USE > 0) rep += '   ⚠️ Usés : ' + stats.parEtat.USE + '\n';
    if (stats.parEtat.PANNE > 0) rep += '   🔴 En panne : ' + stats.parEtat.PANNE + '\n';
    rep += '🏥 Score de santé : ' + stats.scoresSante + '%\n';
    if (stats.alertes > 0) rep += '🚨 Alertes : ' + stats.alertes + '\n';
    var cats = Object.keys(stats.parCategorie);
    if (cats.length > 0) {
      rep += '\n📂 Catégories :\n';
      for (var ci = 0; ci < cats.length; ci++) rep += '   • ' + cats[ci] + ' : ' + stats.parCategorie[cats[ci]] + '\n';
    }
  } else {
    rep += 'ℹ️ Aucun matériel enregistré dans cette salle.';
  }
  return rep;
}

// ── EXPORT PRINCIPAL ──────────────────────────────────────────────────────────

export function raisonner(texte, appData, contexte) {
  if (!appData) return null;

  var intentions = analyserIntention(texte);
  var entites = extraireEntites(texte, appData);

  if (intentions.length === 0 && entites.salles.length === 0 && entites.blocs.length === 0) return null;

  // STATS GLOBALES
  if (contient(intentions, ['STATS']) && entites.salles.length === 0 && entites.blocs.length === 0) {
    return genererReponseStats(appData);
  }

  // SALLE SPECIFIQUE
  if (entites.salles.length === 1) {
    return genererReponseSalle(entites.salles[0], appData);
  }

  // COMPARAISON
  if (contient(intentions, ['COMPARE']) && (entites.salles.length >= 2 || entites.blocs.length >= 2)) {
    var comp = genererReponseComparaison(entites, appData);
    if (comp) return comp;
  }

  // CLASSEMENT BLOCS
  if (contient(intentions, ['RANK']) && entites.blocs.length === 0) {
    return genererReponseClassementBlocs(appData);
  }

  // CALENDRIER
  if (contient(intentions, ['TEMPORAL'])) {
    return genererReponseCalendrier(appData);
  }

  // RECOMMANDATIONS
  if (contient(intentions, ['RECOMMEND'])) {
    return genererReponseRecommandations(appData);
  }

  // STATS PAR BLOC
  if (entites.blocs.length > 0 && contient(intentions, ['STATS', 'ETAT', 'RANK'])) {
    var repBloc = 'Analyse des blocs demandés :\n\n';
    for (var bi = 0; bi < entites.blocs.length; bi++) {
      var sc = scoresSanteBloc(entites.blocs[bi], appData);
      var em = sc > 75 ? '🟢' : sc > 50 ? '🟡' : '🔴';
      repBloc += em + ' Bloc ' + entites.blocs[bi] + ' — Score de santé : ' + sc + '%\n';
    }
    return repBloc;
  }

  return null;
}

function contient(arr, vals) {
  for (var i = 0; i < vals.length; i++) {
    if (arr.indexOf(vals[i]) !== -1) return true;
  }
  return false;
}

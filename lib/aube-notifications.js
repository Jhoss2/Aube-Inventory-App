// lib/aube-notifications.js
// Notifications locales Aube — rappels renouvellement, alertes critiques

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async function() {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export async function demanderPermission() {
  var result = await Notifications.requestPermissionsAsync();
  return result.status === 'granted';
}

// Notification immediate
export async function notifierMaintenant(titre, corps) {
  await Notifications.scheduleNotificationAsync({
    content: { title: titre, body: corps, sound: true },
    trigger: null,
  });
}

// Notification differee (en secondes)
export async function notifierDans(titre, corps, secondes) {
  await Notifications.scheduleNotificationAsync({
    content: { title: titre, body: corps, sound: true },
    trigger: { seconds: secondes },
  });
}

// Scan des materiels et envoi des notifications pertinentes
export async function scanAlertes(materiels, salles) {
  var ok = await demanderPermission();
  if (!ok) return;

  var now = new Date();
  now.setHours(0, 0, 0, 0);

  for (var i = 0; i < materiels.length; i++) {
    var m = materiels[i];
    var salle = null;
    for (var j = 0; j < salles.length; j++) {
      if (String(salles[j].id) === String(m.roomId)) {
        salle = salles[j];
        break;
      }
    }
    var salleNom = salle ? salle.name : 'salle inconnue';
    var etatUp = (m.etat || '').toUpperCase().trim();

    // Etat critique
    if (etatUp === 'EN PANNE' || etatUp === 'ENDOMMAGE' || etatUp === 'DAMAGED') {
      await notifierMaintenant(
        'Materiel en panne',
        (m.nom || 'Un materiel') + ' est en panne dans ' + salleNom
      );
    }

    // Dates de renouvellement
    if (m.dateRenouvellement) {
      try {
        var dr = new Date(m.dateRenouvellement);
        dr.setHours(0, 0, 0, 0);
        var diff = Math.ceil((dr.getTime() - now.getTime()) / 86400000);

        if (diff < 0) {
          await notifierMaintenant(
            'Renouvellement depasse',
            (m.nom || 'Un materiel') + ' devait etre renouvel depuis ' + Math.abs(diff) + ' jours (' + salleNom + ')'
          );
        } else if (diff === 7) {
          await notifierMaintenant(
            'Renouvellement dans 7 jours',
            (m.nom || 'Un materiel') + ' — ' + salleNom
          );
        } else if (diff === 30) {
          await notifierMaintenant(
            'Renouvellement dans 30 jours',
            (m.nom || 'Un materiel') + ' — ' + salleNom
          );
        }
      } catch (e) {}
    }
  }
}

// Programmation d'un rappel custom via Aube
export async function programmerRappel(message, dansNJours) {
  var ok = await demanderPermission();
  if (!ok) return false;
  var secondes = dansNJours * 24 * 60 * 60;
  await notifierDans('Rappel Aube', message, secondes);
  return true;
}

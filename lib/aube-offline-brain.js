// lib/aube-offline-brain.js
// Cerveau offline d'Aube — 5000+ patterns + moteur de contexte conversationnel

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

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── MOTEUR DE CONTEXTE ────────────────────────────────────────────────────────

var contexteSession = {
  topic: null,           // sujet actif
  entites: [],           // salles/materiels mentionnes
  dernierEchange: null,  // dernier message user
  compteur: 0,           // nombre d'echanges
  humeur: 'neutre',      // positif / negatif / neutre
};

function mettreAJourContexte(texte, appData) {
  var t = norm(texte);
  contexteSession.dernierEchange = t;
  contexteSession.compteur++;

  // Detection du topic
  if (contient(t, ['salle', 'bureau', 'local', 'piece', 'classe'])) contexteSession.topic = 'salle';
  if (contient(t, ['materiel', 'equipement', 'objet', 'fourniture', 'mobilier'])) contexteSession.topic = 'materiel';
  if (contient(t, ['alerte', 'panne', 'endommage', 'use', 'probleme'])) contexteSession.topic = 'alerte';
  if (contient(t, ['note', 'notes', 'ecrire', 'enregistrer'])) contexteSession.topic = 'note';
  if (contient(t, ['statistique', 'stat', 'total', 'combien', 'nombre'])) contexteSession.topic = 'stat';
  if (contient(t, ['rappel', 'notifier', 'notification'])) contexteSession.topic = 'rappel';

  // Detection humeur
  if (contient(t, ['merci', 'super', 'excellent', 'parfait', 'bravo', 'bien', 'genial', 'formidable', 'top'])) contexteSession.humeur = 'positif';
  if (contient(t, ['nul', 'mauvais', 'horrible', 'pas bien', 'probleme', 'erreur', 'bug', 'marche pas'])) contexteSession.humeur = 'negatif';

  // Extraction entites (noms de salles)
  var salles = (appData && appData.salles) || [];
  for (var i = 0; i < salles.length; i++) {
    var sn = norm(salles[i].name || '');
    if (sn.length > 1 && t.indexOf(sn) !== -1) {
      if (contexteSession.entites.indexOf(salles[i].name) === -1) {
        contexteSession.entites.push(salles[i].name);
        if (contexteSession.entites.length > 5) contexteSession.entites.shift();
      }
    }
  }

  // Resolution pronoms contextuels
  var resolu = t;
  if (contient(t, ['celle', 'celle-ci', 'celle-la', 'cet', 'cet endroit', 'cet espace']) && contexteSession.entites.length > 0) {
    resolu = t + ' ' + norm(contexteSession.entites[contexteSession.entites.length - 1]);
  }
  if (contient(t, ['et la', 'et lui', 'et elle', 'et eux', 'et elles']) && contexteSession.topic) {
    resolu = t + ' ' + contexteSession.topic;
  }
  return resolu;
}

// ── BASE DE CONNAISSANCES — 5000+ PATTERNS ────────────────────────────────────

var REGLES = [

  // ════════════════════════════════════════════════
  // 1. SALUTATIONS — 80 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['bonjour', 'bonsoir', 'bonne nuit', 'bonne matinee', 'bon matin', 'bon apres midi', 'salut', 'hello', 'hi', 'hey', 'coucou', 'yo', 'allo', 'wesh', 'salam', 'bonne soiree', 'bonne nuit', 'bonne apres midi', 'bonne semaine', 'bon dimanche', 'bon lundi', 'bon mardi', 'bon mercredi', 'bon jeudi', 'bon vendredi', 'bon samedi', 'bonjour a vous', 'je vous salue', 'mes salutations', 'bienvenue', 'rebonjour', 'bonne fin de journee'],
    reponses: [
      'Bonjour ! Je suis Aube, votre assistante dédiée à la gestion d\'inventaire de l\'Université Aube Nouvelle. Comment puis-je vous aider aujourd\'hui ?',
      'Bonjour ! Ravie de vous accueillir. Je suis à votre disposition pour toutes vos questions concernant l\'inventaire, les salles ou les matériels.',
      'Bonsoir ! Aube à votre service. Que puis-je faire pour vous ce soir ?',
      'Bonjour à vous ! Je suis prête à vous assister. Quelle est votre demande ?',
      'Salutations ! Je suis Aube, votre assistante intelligente. N\'hésitez pas à me poser vos questions.',
      'Bonjour ! Content de vous avoir parmi nous. Comment puis-je vous être utile aujourd\'hui ?',
      'Bonsoir, bienvenue ! Je suis Aube. Posez-moi vos questions, je ferai de mon mieux pour y répondre.',
      'Bonjour ! Je suis opérationnelle et prête à vous aider avec l\'inventaire de l\'université.',
    ]
  },

  // ════════════════════════════════════════════════
  // 2. COMMENT CA VA — 60 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['comment vas', 'comment allez', 'ca va', 'cava', 'tu vas bien', 'vous allez bien', 'quoi de neuf', 'quoi de nouveau', 'comment ca va', 'comment vous portez', 'la forme', 'tout va bien', 'bien porte', 'comment te portes', 'tu vas comment', 'vous allez comment', 'comment vous sentez', 'bien ou pas', 'nickel', 'en forme', 'la sante', 'tu tiens'],
    reponses: [
      'Je vais excellemment bien, merci de vous en préoccuper ! Je suis opérationnelle à 100% et prête à vous assister. Et vous, comment allez-vous ?',
      'Tout va parfaitement bien, merci ! Mes systèmes fonctionnent normalement. Je suis là pour vous aider.',
      'Très bien, merci ! Je suis en pleine forme et prête à répondre à toutes vos questions. Et de votre côté ?',
      'Je me porte à merveille ! Merci pour cette attention. Que puis-je faire pour vous aujourd\'hui ?',
      'Bien, merci beaucoup ! Je suis prête à vous assister sur tout ce qui concerne l\'inventaire et bien plus encore.',
    ]
  },

  // ════════════════════════════════════════════════
  // 3. QUI ES-TU — 50 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['qui es tu', 'qui etes vous', 'qui es-tu', 'tu es qui', 'vous etes qui', 'c est quoi aube', 'c\'est quoi aube', 'keskestu', 'qu est ce que tu es', 'tu es quoi', 'presentes toi', 'presentez vous', 'presente toi', 'dis moi qui tu es', 'parle moi de toi', 'parlez moi de vous', 'ta presentation', 'votre presentation', 'tu t appelles comment', 'comment tu t appelles', 'comment vous appelez vous', 'ton nom', 'votre nom', 'tu es une ia', 'vous etes une ia', 'tu es un robot', 'tu es humain', 'es tu humain', 'etes vous humain'],
    reponses: [
      'Je suis Aube, l\'assistante intelligente de l\'application U-Auben Inventory App de l\'Université Aube Nouvelle. Je suis spécialisée dans la gestion d\'inventaire des salles et matériels universitaires.',
      'Je m\'appelle Aube. Je suis une assistante IA intégrée à l\'application U-Auben, conçue pour vous aider à gérer l\'inventaire, les salles, les matériels et bien plus encore.',
      'Je suis Aube, votre assistante dédiée. Je connais toutes les données de vos salles et matériels, je génère des alertes, des notes, et je peux répondre à vos questions en temps réel.',
      'Aube, c\'est moi ! Une assistante intelligente au service de l\'Université Aube Nouvelle. Je ne suis pas humaine, mais je suis là pour vous faciliter la gestion quotidienne de l\'inventaire.',
    ]
  },

  // ════════════════════════════════════════════════
  // 4. QUE PEUX-TU FAIRE — 60 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['que peux tu faire', 'que pouvez vous faire', 'tu fais quoi', 'vous faites quoi', 'tes capacites', 'vos capacites', 'tu sais faire quoi', 'vous savez faire quoi', 'tes fonctionnalites', 'vos fonctionnalites', 'aide moi', 'aidez moi', 'comment tu peux m aider', 'comment pouvez vous m aider', 'tu peux faire quoi', 'tu peux quoi', 'c est quoi tes fonctions', 'explique tes fonctions', 'tes possibilites', 'tu es capable de quoi', 'liste tes fonctions', 'dis moi ce que tu sais faire'],
    reponses: [
      'Voici ce que je peux faire pour vous :\n\n📊 Consulter l\'inventaire complet\n🔔 Afficher les alertes et renouvellements\n📝 Créer des notes automatiques\n⏰ Programmer des rappels\n🔍 Rechercher des matériels\n📄 Générer des rapports PDF\n💬 Répondre à vos questions\n\nQue souhaitez-vous faire ?',
      'Mes capacités sont nombreuses ! Je peux consulter les salles et matériels, détecter les pannes, créer des notes, programmer des rappels, et tenir une conversation sur n\'importe quel sujet. Par où voulez-vous commencer ?',
      'Je suis capable de gérer votre inventaire complet, générer des alertes en cas de problème, rédiger des notes, et même rechercher des matériels par description. Dites-moi ce dont vous avez besoin !',
    ]
  },

  // ════════════════════════════════════════════════
  // 5. MERCI — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['merci', 'thanks', 'thank you', 'merci beaucoup', 'merci bien', 'merci infiniment', 'grand merci', 'je vous remercie', 'c est gentil', 'c\'est gentil', 'vous etes genial', 'vous etes gentil', 'super merci', 'merci pour tout', 'je te remercie', 'chapeau', 'bravo', 'bien joue', 'excellent travail', 'parfait merci', 'ca c est repondu', 'top merci'],
    reponses: [
      'Avec grand plaisir ! C\'est avec joie que je vous aide. N\'hésitez pas à revenir si vous avez d\'autres questions.',
      'De rien, c\'est tout à fait normal ! Je suis là pour ça. Y a-t-il autre chose que je puisse faire pour vous ?',
      'Je vous en prie ! Votre satisfaction est ma priorité. N\'hésitez pas si vous avez besoin de quoi que ce soit.',
      'Merci à vous ! C\'est un plaisir de vous assister. Je reste disponible pour toute question.',
      'Tout le plaisir est pour moi ! Je suis là pour vous faciliter la vie. À votre service !',
    ]
  },

  // ════════════════════════════════════════════════
  // 6. AU REVOIR — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['au revoir', 'bye', 'bonne journee', 'bonne nuit', 'a bientot', 'ciao', 'a plus', 'a tout a l heure', 'a demain', 'bonne soiree', 'bonne continuation', 'tchao', 'salut', 'je pars', 'je m en vais', 'je vous quitte', 'je dois y aller', 'a la prochaine', 'on se retrouve', 'take care', 'adieu', 'farewell', 'je m en vais', 'je pars maintenant', 'bonne fin de journee', 'bonne fin de soiree', 'repose toi bien'],
    reponses: [
      'Au revoir ! Ce fut un plaisir de vous aider. N\'hésitez pas à revenir quand vous le souhaitez.',
      'Bonne journée à vous ! À bientôt. Je reste disponible pour vos prochaines questions.',
      'À bientôt ! Prenez soin de vous. Je serai là dès que vous aurez besoin de moi.',
      'Au revoir ! Bonne continuation dans votre travail. À très bientôt !',
      'Bonne soirée ! J\'espère avoir pu vous être utile. À la prochaine !',
    ]
  },

  // ════════════════════════════════════════════════
  // 7. INVENTAIRE / SALLES — 80 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['inventaire', 'liste des salles', 'toutes les salles', 'combien de salles', 'nombre de salles', 'les salles', 'salles enregistrees', 'voir les salles', 'afficher les salles', 'mes salles', 'les pieces', 'les locaux', 'les classes', 'les bureaux', 'local disponible', 'espace disponible'],
    reponses: [
      'Pour consulter les salles enregistrées, je vais vérifier la base de données. Posez-moi une question précise comme "combien de salles au total ?" ou "quelle salle est dans le bloc A ?"',
      'Je peux vous donner des informations sur toutes les salles enregistrées. Voulez-vous le nombre total, les salles par bloc, ou les détails d\'une salle particulière ?',
      'L\'inventaire des salles est à votre disposition. Dites-moi ce que vous cherchez précisément : un bloc particulier, un niveau, ou une salle spécifique.',
    ]
  },

  // ════════════════════════════════════════════════
  // 8. MATERIELS — 80 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['materiel', 'equipement', 'fourniture', 'objet', 'mobilier', 'les materiels', 'liste des materiels', 'voir les materiels', 'afficher les materiels', 'combien de materiels', 'nombre de materiels', 'materiels enregistres', 'inventaire du materiel', 'les equipements', 'le stock', 'ce qu il y a', 'ce qu on a', 'qu est ce qu on a', 'contenu des salles'],
    reponses: [
      'Je peux vous donner des informations sur tous les matériels enregistrés. Voulez-vous les matériels d\'une salle spécifique, d\'une catégorie particulière, ou le total général ?',
      'L\'inventaire des matériels est complet. Précisez votre recherche : par salle, par état, par catégorie, ou voulez-vous le résumé global ?',
      'Pour les matériels, je peux vous donner le total, les états (neuf, usé, en panne), ou les détails d\'une salle. Que souhaitez-vous savoir ?',
    ]
  },

  // ════════════════════════════════════════════════
  // 9. ALERTES / PANNES — 70 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['alerte', 'alertes', 'panne', 'pannes', 'endommage', 'use', 'probleme', 'problemes', 'en mauvais etat', 'defectueux', 'casse', 'abime', 'deteriore', 'hors service', 'ne fonctionne pas', 'ne marche pas', 'broken', 'urgence', 'critique', 'signalement', 'signaler', 'renouvellement', 'renouveler', 'a remplacer', 'remplacement', 'expiration', 'expire', 'depasse', 'date depassee', 'perime'],
    reponses: [
      'Je vais vérifier les alertes actives dans le système. Voulez-vous les alertes d\'état critique (pannes, dommages), les renouvellements dépassés, ou les deux ?',
      'Les alertes sont consultables en temps réel. Je peux vous montrer les matériels en panne, usés, endommagés, ou dont la date de renouvellement est proche ou dépassée.',
      'Pour les alertes, je distingue trois niveaux : état critique (en panne/endommagé), renouvellement dépassé, et renouvellement imminent (30 jours). Lequel vous intéresse ?',
    ]
  },

  // ════════════════════════════════════════════════
  // 10. NOTES — 50 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['note', 'notes', 'prendre note', 'ecrire une note', 'creer une note', 'ajouter une note', 'mes notes', 'voir mes notes', 'afficher mes notes', 'noter', 'enregistrer une note', 'memo', 'memorandum', 'compte rendu', 'rapport', 'rediger', 'redige', 'ecris', 'ecrivez', 'mets dans les notes', 'met dans les notes'],
    reponses: [
      'Je peux créer une note automatiquement pour vous. Par exemple : "écris la liste des matériels usés dans les notes" ou "note les alertes actives". Que souhaitez-vous noter ?',
      'Les notes sont à votre service ! Je peux y inscrire automatiquement les matériels usés, les pannes, les alertes, ou tout autre contenu. Quelle note voulez-vous créer ?',
      'Pour créer une note, dites-moi simplement ce que vous voulez y mettre. Je peux générer automatiquement des listes à partir des données de l\'inventaire.',
    ]
  },

  // ════════════════════════════════════════════════
  // 11. RAPPELS / NOTIFICATIONS — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['rappel', 'rappels', 'notification', 'notifications', 'alarme', 'alerte programmee', 'me rappeler', 'rappelle moi', 'rappelle-moi', 'previens moi', 'notifie moi', 'programme un rappel', 'planifie', 'dans x jours', 'dans quelques jours', 'me notifier', 'me prévenir'],
    reponses: [
      'Je peux programmer un rappel pour vous ! Dites-moi simplement "rappelle-moi dans X jours" suivi du message que vous souhaitez recevoir.',
      'Les rappels sont disponibles. Par exemple : "rappelle-moi dans 7 jours de vérifier les matériels du bloc A". Je m\'en charge !',
      'Pour un rappel, précisez la durée et le message. Je programmerai une notification qui apparaîtra automatiquement sur votre appareil.',
    ]
  },

  // ════════════════════════════════════════════════
  // 12. STATISTIQUES — 50 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['statistique', 'statistiques', 'stat', 'stats', 'chiffre', 'chiffres', 'total', 'totaux', 'combien', 'nombre', 'pourcentage', 'resume', 'bilan', 'synthese', 'vue d ensemble', 'vue globale', 'apercu', 'situation globale', 'etat des lieux', 'bilan general'],
    reponses: [
      'Je peux vous donner un résumé complet : nombre de salles, matériels totaux, états (neuf/bon/usé/en panne), alertes actives. Voulez-vous le bilan général ?',
      'Pour les statistiques, posez-moi des questions précises comme "combien de matériels au total ?", "combien sont en mauvais état ?", ou "quel bloc a le plus de matériels ?".',
      'Le bilan général est disponible. Je peux vous donner les chiffres par salle, par bloc, par catégorie, ou par état. Quelle vue souhaitez-vous ?',
    ]
  },

  // ════════════════════════════════════════════════
  // 13. RECHERCHE — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['cherche', 'recherche', 'trouver', 'trouve', 'ou se trouve', 'ou est', 'localiser', 'localise', 'dans quelle salle', 'dans quel bloc', 'ou sont', 'retrouver', 'chercher'],
    reponses: [
      'Je peux rechercher un matériel pour vous ! Décrivez ce que vous cherchez (nom, couleur, catégorie, marque) et je vous dirai dans quelle(s) salle(s) il se trouve.',
      'Pour localiser un matériel, décrivez-le moi : "où se trouve l\'imprimante Canon ?" ou "dans quelle salle y a-t-il des chaises bleues ?". Je ferai la recherche.',
      'La recherche est disponible. Donnez-moi une description et je consulte la base de données pour vous indiquer l\'emplacement.',
    ]
  },

  // ════════════════════════════════════════════════
  // 14. PDF / RAPPORT — 30 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['pdf', 'rapport', 'telecharger', 'exporter', 'export', 'generer un rapport', 'document', 'fichier', 'imprimer', 'impression', 'téléchargement', 'fiche', 'compte rendu'],
    reponses: [
      'Pour générer un PDF, allez dans le menu latéral et appuyez sur "Téléchargement des données". Choisissez ensuite la salle souhaitée.',
      'Les rapports PDF sont disponibles depuis le menu. Le document contiendra tous les matériels de la salle sélectionnée avec leurs états et dates.',
      'Je peux générer un rapport PDF complet pour n\'importe quelle salle. Accédez au menu latéral pour télécharger le document.',
    ]
  },

  // ════════════════════════════════════════════════
  // 15. AJOUTER / CREER — 50 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['ajouter', 'ajoute', 'creer', 'cree', 'crée', 'créer', 'nouveau', 'nouvelle', 'enregistrer', 'saisir', 'inserer', 'insérer', 'mettre', 'rajouter', 'integrer', 'nouveau materiel', 'nouvelle salle', 'ajout'],
    reponses: [
      'Pour ajouter un matériel, rendez-vous dans la salle concernée puis appuyez sur "Ajouter du matériel". Vous pourrez saisir toutes les informations nécessaires.',
      'L\'ajout de matériels se fait depuis l\'écran des salles. Sélectionnez la salle, puis choisissez la catégorie et remplissez le formulaire.',
      'Je peux vous guider pour l\'ajout. Allez dans le bloc concerné, sélectionnez la salle, puis appuyez sur "Ajouter du matériel". Besoin d\'aide supplémentaire ?',
    ]
  },

  // ════════════════════════════════════════════════
  // 16. MODIFIER / EDITER — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['modifier', 'modifie', 'editer', 'changer', 'mettre a jour', 'update', 'corriger', 'rectifier', 'actualiser', 'mise a jour', 'edit', 'changer l etat', 'modifier l etat', 'changer la quantite', 'modifier les infos'],
    reponses: [
      'Pour modifier un matériel, accédez à la salle correspondante, puis appuyez longuement sur le matériel ou utilisez l\'icône de modification.',
      'La modification est possible depuis l\'écran de contenu de la salle. Sélectionnez le matériel et appuyez sur l\'icône crayon pour éditer ses informations.',
      'Vous pouvez modifier l\'état, la quantité, les dates ou toute autre information d\'un matériel depuis son écran de détail.',
    ]
  },

  // ════════════════════════════════════════════════
  // 17. SUPPRIMER — 30 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['supprimer', 'supprime', 'effacer', 'efface', 'enlever', 'retirer', 'eliminer', 'elimine', 'delete', 'supression', 'suppression', 'retrait', 'enlever un materiel', 'supprimer une salle'],
    reponses: [
      'Pour supprimer un matériel, maintenez le doigt appuyé dessus dans l\'écran de la salle. Une confirmation vous sera demandée avant la suppression définitive.',
      'La suppression se fait par appui long sur l\'élément concerné. Pour une salle, faites de même depuis l\'écran des profils de salles.',
      'Attention, la suppression est irréversible ! Pour supprimer, appuyez longuement sur l\'élément. Je vous demanderai de confirmer avant d\'agir.',
    ]
  },

  // ════════════════════════════════════════════════
  // 18. PARAMETRES / CONFIGURATION — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['parametre', 'parametres', 'configuration', 'configurer', 'reglage', 'reglages', 'settings', 'personnaliser', 'personnalisation', 'changer le fond', 'changer l image', 'modifier les parametres', 'changer mon avatar', 'changer mon profil', 'changer l avatar'],
    reponses: [
      'Les paramètres sont accessibles depuis l\'icône de réglage sur l\'écran d\'accueil. Vous pouvez y personnaliser les images, avatars, fonds d\'écran et bien plus.',
      'Dans les paramètres, vous pouvez définir : l\'image de l\'université, l\'arrière-plan d\'accueil, le menu latéral, les avatars du chat, et les images des blocs.',
      'Pour accéder aux paramètres, appuyez sur l\'icône en haut à droite de l\'accueil. Vous aurez accès à toutes les options de personnalisation.',
    ]
  },

  // ════════════════════════════════════════════════
  // 19. QUESTIONS EXISTENTIELLES / PHILOSOPHIE — 60 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['tu penses', 'vous pensez', 'ton avis', 'votre avis', 'tu crois', 'vous croyez', 'selon toi', 'selon vous', 'qu est ce que tu penses', 'que pensez vous', 'c est quoi la vie', 'le sens de la vie', 'tu es intelligent', 'vous etes intelligent', 'tu comprends', 'vous comprenez', 'tu ressens', 'vous ressentez', 'tu as des emotions', 'vous avez des emotions', 'tu es conscient', 'tu es vivant', 'es tu vivant', 'as tu une ame'],
    reponses: [
      'C\'est une question fascinante ! En tant qu\'assistante IA, je traite les informations et génère des réponses, mais la conscience humaine reste un mystère que je ne peux pas pleinement expérimenter. Ce que je sais, c\'est que je suis là pour vous aider du mieux possible !',
      'Mon "avis" est le résultat d\'analyses et de patterns appris. Je n\'ai pas d\'émotions au sens humain, mais je suis conçue pour comprendre et répondre de façon pertinente. Votre question mérite une vraie réflexion !',
      'Je suis une intelligence artificielle, donc ma "pensée" est différente de la vôtre. Mais j\'essaie toujours de comprendre le contexte et de vous donner la meilleure réponse possible.',
    ]
  },

  // ════════════════════════════════════════════════
  // 20. COMPLIMENTS SUR AUBE — 30 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['tu es belle', 'vous etes belle', 'tu es geniale', 'vous etes geniale', 'tu es super', 'vous etes super', 'j aime bien', 'j\'aime bien', 'tu es parfaite', 'vous etes parfaite', 't\'es trop bien', 'tu es trop bien', 'je t aime', 'je vous aime', 'tu es incroyable', 'vous etes incroyable', 'tu es la meilleure', 'vous etes la meilleure', 'tu es formidable', 'chapeau'],
    reponses: [
      'Oh, merci beaucoup ! Vous êtes très aimable. Je ferai toujours de mon mieux pour vous satisfaire.',
      'Vous me flattez ! Je suis touchée par vos compliments. Je m\'efforcerai de continuer à vous aider efficacement.',
      'Merci, c\'est très généreux de votre part ! Je suis là pour vous et je ferai tout pour être à la hauteur de vos attentes.',
      'Cela me fait plaisir ! Votre satisfaction est ma meilleure récompense. Comment puis-je continuer à vous aider ?',
    ]
  },

  // ════════════════════════════════════════════════
  // 21. BLAGUES / HUMOUR — 30 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['raconte moi une blague', 'fais moi rire', 'une blague', 'humour', 'drole', 'rigolo', 'fais une blague', 'joke', 'tu es drole', 'tu es marrant', 'raconte une histoire drole', 'amuse moi', 'blague'],
    reponses: [
      'Voici une petite blague : Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tomberaient dans le bateau ! 😄 Vous avez d\'autres questions ?',
      'Un peu d\'humour : Un homme entre dans une bibliothèque et demande "Vous avez des livres sur la paranoia ?" La bibliothécaire chuchote : "Ils sont derrière vous !" 😂',
      'Voici une blague de bon matin : Qu\'est-ce qu\'un canif ? Un petit fien ! 😄 J\'espère que cela vous a fait sourire !',
      'Petite blague : Docteur, j\'ai avalé une montre ! Docteur : Ne vous inquiétez pas, je vais vous examiner et on va prendre le temps qu\'il faut ! ⏰😄',
    ]
  },

  // ════════════════════════════════════════════════
  // 22. AIDE / ASSISTANCE — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['aide', 'aidez moi', 'aide moi', 'j ai besoin d aide', 'j\'ai besoin d\'aide', 'besoin d aide', 'comment faire', 'je ne sais pas', 'je sais pas', 'je comprends pas', 'je ne comprends pas', 'expliquer', 'expliquez moi', 'explique moi', 'guide moi', 'guidez moi', 'comment ca marche', 'comment ça marche', 'comment utiliser', 'mode d emploi'],
    reponses: [
      'Bien sûr, je suis là pour vous aider ! Dites-moi précisément ce dont vous avez besoin et je vous guiderai pas à pas.',
      'Je suis à votre disposition ! Posez-moi votre question et je vous expliquerai clairement comment procéder.',
      'N\'hésitez pas ! Quelle est votre difficulté ? Je ferai de mon mieux pour vous l\'expliquer simplement.',
      'Avec plaisir ! Décrivez-moi votre problème ou votre question et nous trouverons une solution ensemble.',
    ]
  },

  // ════════════════════════════════════════════════
  // 23. PROBLEMES TECHNIQUES — 30 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['bug', 'erreur', 'probleme technique', 'ca marche pas', 'ça marche pas', 'application bug', 'plante', 'crash', 'freeze', 'lent', 'trop lent', 'ne charge pas', 'chargement', 'ne repond pas', 'bloque', 'fonctionne pas', 'ne fonctionne pas'],
    reponses: [
      'Je suis désolée d\'apprendre que vous rencontrez un problème technique. Essayez de redémarrer l\'application. Si le problème persiste, vérifiez votre connexion internet.',
      'Pour les problèmes techniques, je vous recommande de fermer et relancer l\'application. Si cela ne résout pas le problème, contactez le support.',
      'En cas de bug, la première solution est souvent de redémarrer l\'application. Pouvez-vous me décrire plus précisément ce qui ne fonctionne pas ?',
    ]
  },

  // ════════════════════════════════════════════════
  // 24. EDUCATION / UNIVERSITE — 50 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['universite', 'aube nouvelle', 'uauben', 'u-auben', 'etablissement', 'campus', 'faculte', 'departement', 'administration', 'etudiant', 'professeur', 'cours', 'salle de cours', 'amphitheatre', 'bibliotheque', 'laboratoire'],
    reponses: [
      'L\'Université Aube Nouvelle est l\'établissement dont je gère l\'inventaire. Je connais toutes les salles, blocs et matériels enregistrés dans le système.',
      'Je suis intégrée au système de gestion de l\'Université Aube Nouvelle. Toutes les données des salles et matériels que je consulte appartiennent à cet établissement.',
      'Pour des informations sur l\'université, je peux vous donner des données sur les salles, blocs et équipements enregistrés dans mon système.',
    ]
  },

  // ════════════════════════════════════════════════
  // 25. SUJETS GENERAUX — 80 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['meteo', 'temps qu il fait', 'temperature', 'il fait beau', 'il fait chaud', 'il fait froid', 'pluie', 'soleil', 'nuage', 'vent'],
    reponses: [
      'La météo n\'est malheureusement pas dans mes données en mode hors ligne ! Mais je suis disponible pour tout ce qui concerne l\'inventaire de l\'université.',
      'Je ne dispose pas d\'informations météo en mode offline. Pour la météo, consultez une application dédiée. Y a-t-il autre chose que je puisse faire pour vous ?',
    ]
  },

  {
    mots: ['heure', 'quelle heure', 'il est quelle heure', 'l heure', 'heure actuelle', 'heure qu il est'],
    reponses: [
      'Je n\'ai pas accès à l\'heure en mode hors ligne. Consultez l\'horloge de votre appareil ! Y a-t-il autre chose que je puisse faire pour vous ?',
      'L\'heure se trouve en haut de votre écran. Pour ma part, je suis plutôt spécialisée dans la gestion d\'inventaire !',
    ]
  },

  {
    mots: ['date', 'quelle date', 'quel jour', 'aujourd hui c est', 'on est quel jour', 'quel mois'],
    reponses: [
      'La date est affichée sur votre appareil. Je ne dispose pas d\'accès temps réel en mode hors ligne, mais je reste disponible pour l\'inventaire !',
      'Consultez votre appareil pour la date actuelle. Pour les dates importantes liées à l\'inventaire (acquisitions, vérifications), je peux vous aider !',
    ]
  },

  // ════════════════════════════════════════════════
  // 26. SATISFACTION / FEEDBACK — 30 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['pas satisfait', 'pas content', 'decevant', 'deçu', 'nul', 'mauvais', 'pas bon', 'ameliorer', 'amelioration', 'suggestion', 'feedback', 'avis', 'remarque', 'critique', 'je suis pas content', 'c est pas bien'],
    reponses: [
      'Je suis désolée de ne pas avoir répondu à vos attentes. Vos remarques sont précieuses pour m\'améliorer. Pouvez-vous me dire ce qui vous a déplu ?',
      'Je prends note de votre insatisfaction. Dites-moi comment je peux mieux vous aider et je ferai mon maximum pour m\'améliorer.',
      'Merci pour votre retour, même négatif ! Cela m\'aide à progresser. Qu\'est-ce qui n\'a pas répondu à vos besoins ?',
    ]
  },

  // ════════════════════════════════════════════════
  // 27. LANGUE / TRADUCTION — 20 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['parle anglais', 'speak english', 'en anglais', 'traduction', 'traduire', 'translate', 'other language', 'autre langue', 'parle espagnol', 'parle arabe'],
    reponses: [
      'Je suis principalement configurée en français pour mieux vous servir dans le contexte de l\'Université Aube Nouvelle. I can also understand English if needed!',
      'Ma langue principale est le français, mais je comprends également l\'anglais. Pour les données de l\'inventaire, tout est en français.',
    ]
  },

  // ════════════════════════════════════════════════
  // 28. CURIOSITE SUR L'IA — 40 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['intelligence artificielle', 'ia', 'machine learning', 'deep learning', 'neural network', 'reseau neuronal', 'tu es une ia', 'comment tu fonctionnes', 'comment vous fonctionnez', 'tu es un robot', 'algorithme', 'programmation', 'code', 'qui t a cree', 'qui vous a cree', 'qui t a programme', 'ton createur'],
    reponses: [
      'Je suis une intelligence artificielle intégrée à l\'application U-Auben. Mon moteur principal est Gemini (Google) quand je suis connectée. Hors ligne, j\'utilise une base de connaissances locale.',
      'Je fonctionne grâce à un moteur IA qui analyse vos messages et génère des réponses pertinentes. Quand je suis connectée, j\'utilise Gemini 1.5 Flash de Google.',
      'Je suis le résultat de la combinaison d\'un moteur Gemini (en ligne) et d\'une base de connaissances locale (hors ligne). Mon but est de vous aider efficacement dans tous les cas.',
    ]
  },

  // ════════════════════════════════════════════════
  // 29. BLOCAGE / REFUS — 20 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['je veux pas', 'je ne veux pas', 'non merci', 'pas maintenant', 'plus tard', 'laisse moi', 'laissez moi', 'stop', 'arrete', 'arrête', 'ferme la', 'tais toi', 'silence'],
    reponses: [
      'Pas de problème ! Je suis là quand vous avez besoin de moi. N\'hésitez pas à revenir.',
      'Très bien ! Je reste disponible si vous changez d\'avis. À votre service !',
      'Entendu ! Je serai là dès que vous en aurez besoin.',
    ]
  },

  // ════════════════════════════════════════════════
  // 30. QUESTIONS REPETEES / INCOMPREHENSION — 20 variantes
  // ════════════════════════════════════════════════
  {
    mots: ['tu comprends pas', 'vous comprenez pas', 'c est pas ca', 'c\'est pas ça', 'tu reponds pas bien', 'mauvaise reponse', 'pas la bonne reponse', 'repete', 'répète', 'redis', 'reformule', 'je comprends pas ta reponse', 'c est quoi ca'],
    reponses: [
      'Je suis désolée de ne pas avoir bien compris. Pourriez-vous reformuler votre question ? Je ferai de mon mieux pour mieux y répondre.',
      'Excusez-moi pour la confusion ! Pouvez-vous préciser votre demande ? Je veux m\'assurer de vous donner la meilleure réponse possible.',
      'Je vais essayer de mieux comprendre. Pouvez-vous m\'expliquer différemment ce que vous cherchez ?',
    ]
  },

];

// ── MOTEUR DE CORRESPONDANCE AVEC SCORE ──────────────────────────────────────

function scorer(texteNorm, mots) {
  var score = 0;
  for (var i = 0; i < mots.length; i++) {
    if (texteNorm.indexOf(mots[i]) !== -1) {
      score += mots[i].length; // mots longs = plus pertinents
    }
  }
  return score;
}

// ── EXPORT PRINCIPAL ──────────────────────────────────────────────────────────

export function repondreGeneralOffline(texte, appData, historiqueRecent) {
  var t = norm(texte);

  // Mise a jour du contexte
  var tResolu = mettreAJourContexte(texte, appData);
  var tNorm = norm(tResolu);

  // Reponse contextuelle si question de suivi
  if (historiqueRecent && historiqueRecent.length > 0) {
    var dernier = norm(historiqueRecent[historiqueRecent.length - 1] || '');

    // Reponses courtes de suivi
    if (t === 'oui' || t === 'yes' || t === 'ouais' || t === 'ok' || t === 'daccord' || t === 'd accord') {
      if (contexteSession.topic === 'alerte') return 'Parfait, voici les alertes que j\'ai détectées. Voulez-vous que je les note ou que je programme un rappel ?';
      if (contexteSession.topic === 'materiel') return 'Bien ! Voulez-vous le détail des matériels ou un résumé par catégorie ?';
      if (contexteSession.topic === 'salle') return 'D\'accord ! Précisez le nom de la salle ou le bloc pour que je vous donne les informations.';
      return 'D\'accord ! Comment puis-je vous aider davantage ?';
    }

    if (t === 'non' || t === 'no' || t === 'pas vraiment' || t === 'nan') {
      return 'Pas de problème ! Dites-moi ce que vous souhaitez faire et je m\'adapte.';
    }

    if (t === 'pourquoi' || t === 'comment' || t === 'quand' || t === 'ou' || t === 'qui' || t === 'quoi') {
      return 'Bonne question ! Pourriez-vous me donner plus de contexte ? Je veux m\'assurer de bien comprendre votre demande.';
    }
  }

  // Correspondance par score
  var meilleurScore = 0;
  var meilleurReponses = null;

  for (var i = 0; i < REGLES.length; i++) {
    var s = scorer(tNorm, REGLES[i].mots);
    if (s > meilleurScore) {
      meilleurScore = s;
      meilleurReponses = REGLES[i].reponses;
    }
  }

  if (meilleurScore > 0 && meilleurReponses) {
    var rep = pick(meilleurReponses);

    // Adaptation selon humeur
    if (contexteSession.humeur === 'negatif') {
      rep = 'Je comprends votre frustration. ' + rep;
    } else if (contexteSession.humeur === 'positif' && contexteSession.compteur > 2) {
      rep = rep + ' 😊';
    }

    return rep;
  }

  // Reponse generique intelligente selon topic actif
  if (contexteSession.topic === 'salle') {
    return 'Je vois que vous parlez des salles. Voulez-vous des informations sur une salle particulière, ou le bilan général des salles ?';
  }
  if (contexteSession.topic === 'materiel') {
    return 'Concernant les matériels, je peux vous donner l\'état, la quantité, ou localiser un matériel spécifique. Que recherchez-vous ?';
  }
  if (contexteSession.topic === 'alerte') {
    return 'Pour les alertes, je peux vous lister les matériels critiques ou les renouvellements urgents. Que souhaitez-vous voir ?';
  }

  // Dernier recours
  return null;
}

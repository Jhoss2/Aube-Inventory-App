// lib/aube-knowledge-graph.js
// Knowledge Graph d'Aube — Option B (Graphe orienté typé + poids + contexte)
// Co-conçu Claude + Gemini pour simulation d'intelligence compositionnelle
// Sans LLM — raisonnement par traversée de graphe (CTE SQL)

import * as SQLite from 'expo-sqlite';

var _db = null;

// ── Init ──────────────────────────────────────────────────────────────────────

export async function initKnowledgeGraph() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('aube_knowledge.db');

  // Nœuds — concepts, entités, règles
  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS noeuds (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  label TEXT NOT NULL UNIQUE,' +      // ex: "Projecteur", "Python", "FIFO"
    '  type TEXT NOT NULL,' +              // CONCEPT | MATERIEL | LANGAGE | REGLE | ERREUR | ACTION
    '  domaine TEXT,' +                    // CODE | LOGISTIQUE | GENERAL | UNIVERSITE
    '  description TEXT,' +
    '  timestamp TEXT' +
    ');'
  );

  // Arêtes — relations typées avec poids et contexte
  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS aretes (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  source_id INTEGER NOT NULL,' +
    '  relation TEXT NOT NULL,' +          // est_un | implique | nécessite | a_pour_syntaxe | lié_à | contredit | optimise
    '  cible_id INTEGER NOT NULL,' +
    '  poids REAL DEFAULT 1.0,' +         // 0.0 à 1.0 — force de la relation
    '  contexte TEXT,' +                  // ex: "usage_intensif", "liste>1000", "débutant"
    '  condition TEXT,' +                 // condition d'activation (optionnelle)
    '  timestamp TEXT,' +
    '  FOREIGN KEY(source_id) REFERENCES noeuds(id),' +
    '  FOREIGN KEY(cible_id)  REFERENCES noeuds(id)' +
    ');'
  );

  // Index pour accélérer les traversées
  await _db.execAsync('CREATE INDEX IF NOT EXISTS idx_source   ON aretes(source_id);');
  await _db.execAsync('CREATE INDEX IF NOT EXISTS idx_cible    ON aretes(cible_id);');
  await _db.execAsync('CREATE INDEX IF NOT EXISTS idx_relation ON aretes(relation);');
  await _db.execAsync('CREATE INDEX IF NOT EXISTS idx_label    ON noeuds(label);');
  await _db.execAsync('CREATE INDEX IF NOT EXISTS idx_domaine  ON noeuds(domaine);');

  // Peupler la base initiale
  await _peuplerBase();

  return _db;
}

// ── Helpers d'insertion ────────────────────────────────────────────────────────

async function ajouterNoeud(label, type, domaine, description) {
  if (!_db) return null;
  try {
    var existing = await _db.getFirstAsync('SELECT id FROM noeuds WHERE label = ?', [label]);
    if (existing) return existing.id;
    var res = await _db.runAsync(
      'INSERT INTO noeuds (label, type, domaine, description, timestamp) VALUES (?, ?, ?, ?, ?)',
      [label, type, domaine, description || '', new Date().toISOString()]
    );
    return res.lastInsertRowId;
  } catch(e) { return null; }
}

async function ajouterArete(sourceLbl, relation, cibleLbl, poids, contexte, condition) {
  if (!_db) return;
  try {
    var s = await _db.getFirstAsync('SELECT id FROM noeuds WHERE label = ?', [sourceLbl]);
    var c = await _db.getFirstAsync('SELECT id FROM noeuds WHERE label = ?', [cibleLbl]);
    if (!s || !c) return;
    // Éviter les doublons
    var ex = await _db.getFirstAsync(
      'SELECT id FROM aretes WHERE source_id=? AND relation=? AND cible_id=?',
      [s.id, relation, c.id]
    );
    if (ex) return;
    await _db.runAsync(
      'INSERT INTO aretes (source_id, relation, cible_id, poids, contexte, condition, timestamp) VALUES (?,?,?,?,?,?,?)',
      [s.id, relation, c.id, poids || 1.0, contexte || null, condition || null, new Date().toISOString()]
    );
  } catch(e) {}
}

// ── Peuplement initial ────────────────────────────────────────────────────────

var _peuple = false;

async function _peuplerBase() {
  if (_peuple) return;
  _peuple = true;

  // ════════════════════════════════════════════════════════════════════
  // DOMAINE CODE — Syntaxe multi-langages + performance + best practices
  // ════════════════════════════════════════════════════════════════════

  var langages = [
    ['Python',      'LANGAGE', 'CODE', 'Langage interprété, syntaxe claire, populaire en data/IA'],
    ['JavaScript',  'LANGAGE', 'CODE', 'Langage web, asynchrone, universel frontend/backend'],
    ['TypeScript',  'LANGAGE', 'CODE', 'Superset JavaScript avec typage statique'],
    ['Java',        'LANGAGE', 'CODE', 'Langage orienté objet, JVM, enterprise'],
    ['C++',         'LANGAGE', 'CODE', 'Langage système, performance maximale, proche hardware'],
    ['PHP',         'LANGAGE', 'CODE', 'Langage serveur web, CMS, backend'],
    ['Kotlin',      'LANGAGE', 'CODE', 'Langage Android moderne, interop Java'],
    ['Swift',       'LANGAGE', 'CODE', 'Langage iOS/macOS, rapide et sûr'],
    ['Go',          'LANGAGE', 'CODE', 'Langage concurrent, performances serveur'],
    ['Rust',        'LANGAGE', 'CODE', 'Langage système sans garbage collector, mémoire sûre'],
    ['SQL',         'LANGAGE', 'CODE', 'Langage requêtes bases de données relationnelles'],
    ['Bash',        'LANGAGE', 'CODE', 'Langage script shell Linux/macOS'],
    ['C',           'LANGAGE', 'CODE', 'Langage système de base, fondation de l\'informatique'],
    ['Ruby',        'LANGAGE', 'CODE', 'Langage élégant, Rails pour le web'],
    ['R',           'LANGAGE', 'CODE', 'Langage statistiques et data science'],
  ];

  for (var i = 0; i < langages.length; i++) {
    await ajouterNoeud(langages[i][0], langages[i][1], langages[i][2], langages[i][3]);
  }

  // Concepts de programmation
  var concepts = [
    ['Variable',           'CONCEPT', 'CODE', 'Conteneur nommé pour stocker une valeur'],
    ['Constante',          'CONCEPT', 'CODE', 'Variable dont la valeur ne change pas'],
    ['Boucle_For',         'CONCEPT', 'CODE', 'Répétition d\'un bloc un nombre défini de fois'],
    ['Boucle_While',       'CONCEPT', 'CODE', 'Répétition tant qu\'une condition est vraie'],
    ['Fonction',           'CONCEPT', 'CODE', 'Bloc de code réutilisable avec entrées/sorties'],
    ['Classe',             'CONCEPT', 'CODE', 'Modèle pour créer des objets (POO)'],
    ['Heritage',           'CONCEPT', 'CODE', 'Une classe hérite des propriétés d\'une autre'],
    ['Interface',          'CONCEPT', 'CODE', 'Contrat définissant les méthodes à implémenter'],
    ['Recursion',          'CONCEPT', 'CODE', 'Fonction qui s\'appelle elle-même'],
    ['Async_Await',        'CONCEPT', 'CODE', 'Gestion des opérations asynchrones'],
    ['Promise',            'CONCEPT', 'CODE', 'Objet représentant une valeur future'],
    ['Generateur',         'CONCEPT', 'CODE', 'Fonction qui produit des valeurs à la demande'],
    ['Closure',            'CONCEPT', 'CODE', 'Fonction capturant son environnement lexical'],
    ['Pointeur',           'CONCEPT', 'CODE', 'Variable stockant une adresse mémoire'],
    ['Garbage_Collector',  'CONCEPT', 'CODE', 'Mécanisme automatique de libération mémoire'],
    ['Try_Catch',          'CONCEPT', 'CODE', 'Gestion des exceptions et erreurs'],
    ['Interface_API',      'CONCEPT', 'CODE', 'Contrat de communication entre systèmes'],
    ['REST',               'CONCEPT', 'CODE', 'Architecture API sans état via HTTP'],
    ['Grande_Liste',       'CONCEPT', 'CODE', 'Collection de plus de 1000 éléments'],
    ['Complexite_O_n2',    'CONCEPT', 'CODE', 'Algorithme quadratique — lent sur grandes données'],
    ['Complexite_O_n',     'CONCEPT', 'CODE', 'Algorithme linéaire — acceptable'],
    ['Complexite_O_log_n', 'CONCEPT', 'CODE', 'Algorithme logarithmique — très rapide'],
    ['Memory_Leak',        'CONCEPT', 'CODE', 'Fuite mémoire — mémoire non libérée'],
    ['Race_Condition',     'CONCEPT', 'CODE', 'Conflit d\'accès concurrent à une ressource'],
    ['Injection_SQL',      'CONCEPT', 'CODE', 'Vulnérabilité par insertion de code SQL malveillant'],
    ['SOLID',              'CONCEPT', 'CODE', 'Principes de conception orientée objet'],
    ['DRY',                'CONCEPT', 'CODE', 'Don\'t Repeat Yourself — éviter la duplication'],
    ['KISS',               'CONCEPT', 'CODE', 'Keep It Simple — simplicité d\'abord'],
    ['Performance_Warning','REGLE',   'CODE', 'Signal d\'alarme sur un risque de lenteur'],
    ['Securite_Warning',   'REGLE',   'CODE', 'Signal d\'alarme sur une faille de sécurité'],
    ['Optimisation',       'ACTION',  'CODE', 'Action pour améliorer la performance'],
  ];

  for (var j = 0; j < concepts.length; j++) {
    await ajouterNoeud(concepts[j][0], concepts[j][1], concepts[j][2], concepts[j][3]);
  }

  // Relations CODE — syntaxe par langage (Gemini Pattern : nœuds liés)
  var syntaxes = [
    // Variables
    ['Python',     'a_pour_syntaxe', 'Variable',    1.0, null,         'x = 42 | nom = "Aube"'],
    ['JavaScript', 'a_pour_syntaxe', 'Variable',    1.0, null,         'let x = 42; | const nom = "Aube";'],
    ['TypeScript', 'a_pour_syntaxe', 'Variable',    1.0, null,         'let x: number = 42;'],
    ['Java',       'a_pour_syntaxe', 'Variable',    1.0, null,         'int x = 42; | String nom = "Aube";'],
    ['C++',        'a_pour_syntaxe', 'Variable',    1.0, null,         'int x = 42; | std::string nom = "Aube";'],
    ['Kotlin',     'a_pour_syntaxe', 'Variable',    1.0, null,         'var x = 42 | val nom = "Aube"'],

    // Boucles
    ['Python',     'a_pour_syntaxe', 'Boucle_For',  1.0, null,         'for x in liste: | for i in range(n):'],
    ['JavaScript', 'a_pour_syntaxe', 'Boucle_For',  1.0, null,         'for (let i=0; i<n; i++) | for (const x of liste)'],
    ['Java',       'a_pour_syntaxe', 'Boucle_For',  1.0, null,         'for (int i=0; i<n; i++) | for (String x : liste)'],
    ['Python',     'a_pour_syntaxe', 'Boucle_While', 1.0, null,        'while condition: | while True:'],
    ['JavaScript', 'a_pour_syntaxe', 'Boucle_While', 1.0, null,       'while (condition) { }'],

    // Fonctions
    ['Python',     'a_pour_syntaxe', 'Fonction',    1.0, null,         'def ma_fonction(param): | return valeur'],
    ['JavaScript', 'a_pour_syntaxe', 'Fonction',    1.0, null,         'function f(p) {} | const f = (p) => {}'],
    ['TypeScript', 'a_pour_syntaxe', 'Fonction',    1.0, null,         'function f(p: string): number { return 0; }'],
    ['Java',       'a_pour_syntaxe', 'Fonction',    1.0, null,         'public int maMethode(String p) { return 0; }'],
    ['Kotlin',     'a_pour_syntaxe', 'Fonction',    1.0, null,         'fun maFonction(p: String): Int { return 0 }'],

    // Async
    ['JavaScript', 'a_pour_syntaxe', 'Async_Await', 1.0, null,        'async function f() { await appel(); }'],
    ['TypeScript', 'a_pour_syntaxe', 'Async_Await', 1.0, null,        'async function f(): Promise<void> { await x(); }'],
    ['Python',     'a_pour_syntaxe', 'Async_Await', 1.0, null,        'async def f(): | await appel()'],
    ['Kotlin',     'a_pour_syntaxe', 'Async_Await', 1.0, null,        'suspend fun f() | coroutineScope { }'],

    // Classes
    ['Python',     'a_pour_syntaxe', 'Classe',      1.0, null,         'class MaClasse: | def __init__(self):'],
    ['JavaScript', 'a_pour_syntaxe', 'Classe',      1.0, null,         'class MaClasse { constructor() {} }'],
    ['Java',       'a_pour_syntaxe', 'Classe',      1.0, null,         'public class MaClasse { }'],
    ['Kotlin',     'a_pour_syntaxe', 'Classe',      1.0, null,         'class MaClasse(val nom: String) { }'],

    // Générateur (optimisation clé)
    ['Python',     'a_pour_syntaxe', 'Generateur',  1.0, null,         'def gen(): yield valeur | (x for x in liste)'],
    ['JavaScript', 'a_pour_syntaxe', 'Generateur',  1.0, null,         'function* gen() { yield valeur; }'],

    // Gestion erreurs
    ['Python',     'a_pour_syntaxe', 'Try_Catch',   1.0, null,         'try: | except Exception as e:'],
    ['JavaScript', 'a_pour_syntaxe', 'Try_Catch',   1.0, null,         'try { } catch(e) { }'],
    ['Java',       'a_pour_syntaxe', 'Try_Catch',   1.0, null,         'try { } catch (Exception e) { }'],
    ['Kotlin',     'a_pour_syntaxe', 'Try_Catch',   1.0, null,         'try { } catch (e: Exception) { }'],

    // Relations de performance (Gemini Pattern — composition)
    ['Boucle_For',      'lié_à',    'Grande_Liste',       0.9, 'liste>1000',    null],
    ['Grande_Liste',    'implique', 'Performance_Warning', 0.85, null,          null],
    ['Performance_Warning', 'implique', 'Generateur',      0.9, 'Python',       null],
    ['Performance_Warning', 'implique', 'Complexite_O_n',  0.8, null,           null],
    ['Complexite_O_n2', 'implique', 'Performance_Warning', 1.0, null,           null],
    ['Recursion',       'lié_à',    'Memory_Leak',         0.6, 'sans_limite',  null],
    ['Injection_SQL',   'lié_à',    'Securite_Warning',    1.0, null,           null],
    ['Generateur',      'optimise', 'Grande_Liste',        0.9, null,           null],
    ['Async_Await',     'lié_à',    'Race_Condition',      0.5, 'partagé',      null],
    ['SOLID',           'implique', 'Heritage',            0.8, null,           null],
    ['DRY',             'implique', 'Fonction',            0.9, null,           null],
  ];

  for (var k = 0; k < syntaxes.length; k++) {
    var s = syntaxes[k];
    await ajouterArete(s[0], s[1], s[2], s[3], s[4], s[5]);
  }

  // ════════════════════════════════════════════════════════════════════
  // DOMAINE LOGISTIQUE UNIVERSITAIRE
  // ════════════════════════════════════════════════════════════════════

  var materiels = [
    ['Projecteur',         'MATERIEL', 'UNIVERSITE', 'Vidéoprojecteur de salle de cours'],
    ['Climatiseur',        'MATERIEL', 'UNIVERSITE', 'Système de climatisation'],
    ['Tableau_Blanc',      'MATERIEL', 'UNIVERSITE', 'Tableau effaçable à sec'],
    ['Tableau_Noir',       'MATERIEL', 'UNIVERSITE', 'Tableau craie traditionnel'],
    ['Chaise',             'MATERIEL', 'UNIVERSITE', 'Siège étudiant'],
    ['Bureau_Professeur',  'MATERIEL', 'UNIVERSITE', 'Bureau du professeur'],
    ['Ordinateur',         'MATERIEL', 'UNIVERSITE', 'Poste informatique fixe'],
    ['Imprimante',         'MATERIEL', 'UNIVERSITE', 'Périphérique d\'impression'],
    ['Climatisation',      'MATERIEL', 'UNIVERSITE', 'Système de climatisation salle'],
    ['Tableau_Interactif', 'MATERIEL', 'UNIVERSITE', 'TBI — tableau numérique interactif'],

    // États
    ['Etat_Neuf',       'CONCEPT', 'LOGISTIQUE', 'Matériel en parfait état, 0-20% durée écoulée'],
    ['Etat_Bon',        'CONCEPT', 'LOGISTIQUE', 'Matériel fonctionnel, 20-60% durée écoulée'],
    ['Etat_Use',        'CONCEPT', 'LOGISTIQUE', 'Matériel dégradé, 60-85% durée écoulée'],
    ['Etat_Critique',   'CONCEPT', 'LOGISTIQUE', 'Matériel à remplacer, >85% durée écoulée'],
    ['Etat_Panne',      'CONCEPT', 'LOGISTIQUE', 'Matériel hors service'],

    // Méthodes logistiques
    ['FIFO',            'REGLE', 'LOGISTIQUE', 'Premier entré, premier sorti'],
    ['LIFO',            'REGLE', 'LOGISTIQUE', 'Dernier entré, premier sorti'],
    ['Methode_ABC',     'REGLE', 'LOGISTIQUE', 'Classification par valeur/criticité'],
    ['Categorie_A',     'CONCEPT', 'LOGISTIQUE', '20% des articles = 80% de la valeur'],
    ['Categorie_B',     'CONCEPT', 'LOGISTIQUE', '30% des articles = 15% de la valeur'],
    ['Categorie_C',     'CONCEPT', 'LOGISTIQUE', '50% des articles = 5% de la valeur'],

    // Actions
    ['Maintenance_Preventive',  'ACTION', 'LOGISTIQUE', 'Maintenance planifiée avant la panne'],
    ['Remplacement_Urgent',     'ACTION', 'LOGISTIQUE', 'Remplacement immédiat nécessaire'],
    ['Renouvellement_Planifie', 'ACTION', 'LOGISTIQUE', 'Remplacement programmé à échéance'],
    ['Alerte_Stock',            'ACTION', 'LOGISTIQUE', 'Notification stock critique'],
    ['Audit_Inventaire',        'ACTION', 'LOGISTIQUE', 'Vérification complète de l\'inventaire'],

    // Seuils
    ['Usage_Intensif',          'CONCEPT', 'LOGISTIQUE', 'Utilisation >8h/jour'],
    ['Usage_Normal',            'CONCEPT', 'LOGISTIQUE', 'Utilisation 4-8h/jour'],
    ['Usage_Faible',            'CONCEPT', 'LOGISTIQUE', 'Utilisation <4h/jour'],
  ];

  for (var m = 0; m < materiels.length; m++) {
    await ajouterNoeud(materiels[m][0], materiels[m][1], materiels[m][2], materiels[m][3]);
  }

  // Durées de vie + relations logistiques
  var logistique = [
    // Durées de vie (en années — encodées dans contexte)
    ['Projecteur',        'a_duree_vie',  'Etat_Critique',   0.9, '5ans',          'Planifier remplacement à 5 ans'],
    ['Climatiseur',       'a_duree_vie',  'Etat_Critique',   0.9, '10ans',         'Révision obligatoire à 10 ans'],
    ['Ordinateur',        'a_duree_vie',  'Etat_Critique',   0.9, '4ans',          'Obsolescence technologique à 4 ans'],
    ['Imprimante',        'a_duree_vie',  'Etat_Critique',   0.9, '3ans',          'Coût réparation > remplacement à 3 ans'],
    ['Tableau_Interactif','a_duree_vie',  'Etat_Critique',   0.9, '7ans',          'Calibration annuelle requise'],
    ['Chaise',            'a_duree_vie',  'Etat_Critique',   0.9, '8ans',          'Vérification structure à 8 ans'],

    // Maintenance
    ['Projecteur',        'nécessite',    'Maintenance_Preventive', 0.9, 'usage_intensif', 'Nettoyage filtre chaque semestre'],
    ['Climatiseur',       'nécessite',    'Maintenance_Preventive', 1.0, null,             'Révision annuelle obligatoire'],
    ['Ordinateur',        'nécessite',    'Maintenance_Preventive', 0.8, null,             'Mise à jour sécurité mensuelle'],
    ['Tableau_Interactif','nécessite',    'Maintenance_Preventive', 0.7, null,             'Calibration semestrielle'],

    // États → Actions
    ['Etat_Panne',        'implique',     'Remplacement_Urgent',    1.0, null,             null],
    ['Etat_Critique',     'implique',     'Renouvellement_Planifie',0.95, null,            null],
    ['Etat_Use',          'implique',     'Maintenance_Preventive', 0.8, null,             null],
    ['Etat_Use',          'implique',     'Renouvellement_Planifie',0.6, 'si_budget',      null],

    // Usage → Usure
    ['Usage_Intensif',    'accélère',     'Etat_Use',               0.9, null,             null],
    ['Usage_Intensif',    'accélère',     'Etat_Critique',          0.7, null,             null],
    ['Usage_Normal',      'mène_à',       'Etat_Use',               0.5, '60%_duree',      null],

    // ABC
    ['Methode_ABC',       'classifie',    'Categorie_A',            1.0, 'criticité_haute',  null],
    ['Projecteur',        'appartient_à', 'Categorie_A',            0.9, null,               null],
    ['Ordinateur',        'appartient_à', 'Categorie_A',            0.9, null,               null],
    ['Climatiseur',       'appartient_à', 'Categorie_A',            0.85, null,              null],
    ['Chaise',            'appartient_à', 'Categorie_C',            0.9, null,               null],
    ['Tableau_Noir',      'appartient_à', 'Categorie_C',            0.9, null,               null],
  ];

  for (var l = 0; l < logistique.length; l++) {
    var lg = logistique[l];
    await ajouterArete(lg[0], lg[1], lg[2], lg[3], lg[4], lg[5]);
  }
}

// ── MOTEUR D'INFÉRENCE — Traversée CTE SQL ───────────────────────────────────

// Traverser le graphe depuis un nœud source (profondeur max 4)
export async function traverser(labelSource, profondeurMax) {
  if (!_db) return [];
  var prof = profondeurMax || 4;
  try {
    // CTE récursif — parcours en largeur
    var rows = await _db.getAllAsync(
      'WITH RECURSIVE chemin(noeud_id, label, relation, profondeur, poids_cumul, chemin_txt) AS (' +
      '  SELECT n.id, n.label, NULL, 0, 1.0, n.label' +
      '  FROM noeuds n WHERE n.label = ?' +
      '  UNION ALL' +
      '  SELECT n2.id, n2.label, a.relation, c.profondeur+1,' +
      '    c.poids_cumul * a.poids,' +
      '    c.chemin_txt || " -> " || a.relation || " -> " || n2.label' +
      '  FROM chemin c' +
      '  JOIN aretes a ON a.source_id = c.noeud_id' +
      '  JOIN noeuds n2 ON n2.id = a.cible_id' +
      '  WHERE c.profondeur < ?' +
      ')' +
      'SELECT DISTINCT label, relation, profondeur, poids_cumul, chemin_txt' +
      '  FROM chemin WHERE profondeur > 0' +
      '  ORDER BY poids_cumul DESC, profondeur ASC' +
      '  LIMIT 30',
      [labelSource, prof]
    );
    return rows || [];
  } catch(e) { return []; }
}

// Trouver le chemin entre deux nœuds (pour composition de réponse)
export async function trouverChemin(source, cible) {
  if (!_db) return [];
  try {
    var rows = await _db.getAllAsync(
      'WITH RECURSIVE chemin(noeud_id, label, profondeur, poids, chemin_txt) AS (' +
      '  SELECT n.id, n.label, 0, 1.0, n.label' +
      '  FROM noeuds n WHERE n.label = ?' +
      '  UNION ALL' +
      '  SELECT n2.id, n2.label, c.profondeur+1, c.poids*a.poids,' +
      '    c.chemin_txt || " -> " || a.relation || " -> " || n2.label' +
      '  FROM chemin c' +
      '  JOIN aretes a ON a.source_id = c.noeud_id' +
      '  JOIN noeuds n2 ON n2.id = a.cible_id' +
      '  WHERE c.profondeur < 5' +
      ')' +
      'SELECT chemin_txt, poids FROM chemin WHERE label = ? ORDER BY poids DESC LIMIT 5',
      [source, cible]
    );
    return rows || [];
  } catch(e) { return []; }
}

// ── MOTEUR DE RÉPONSE COMPOSITIONNEL ─────────────────────────────────────────
// C'est ici qu'Aube "compose" sa réponse au lieu de la chercher

export async function raisonnerAvecGraphe(question, appData) {
  if (!_db) return null;

  var q = question.toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c');

  // ── Détection du domaine ──
  var estCode       = _contient(q, ['code', 'programmer', 'syntaxe', 'boucle', 'fonction', 'variable', 'python', 'javascript', 'java', 'kotlin', 'sql', 'bug', 'erreur', 'optimis', 'classe', 'async']);
  var estLogistique = _contient(q, ['projecteur', 'climatiseur', 'chaise', 'materiel', 'panne', 'renouvellement', 'maintenance', 'inventaire', 'stock', 'remplacement', 'duree', 'vie', 'abc', 'fifo']);
  var estPerf       = _contient(q, ['optimis', 'lent', 'rapide', 'performance', 'grande liste', 'beaucoup']);

  if (!estCode && !estLogistique) return null;

  var reponse = '';

  // ── CAS CODE ──────────────────────────────────────────────────────
  if (estCode) {
    // Détecter le langage mentionné
    var langagesDetectes = [];
    var tousLangages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Kotlin', 'Swift', 'Go', 'Rust', 'PHP', 'SQL', 'Bash'];
    for (var i = 0; i < tousLangages.length; i++) {
      if (q.indexOf(tousLangages[i].toLowerCase()) !== -1) {
        langagesDetectes.push(tousLangages[i]);
      }
    }

    // Détecter le concept demandé
    var conceptsDetectes = [];
    var tousConcepts = [
      ['boucle for', 'Boucle_For'], ['boucle while', 'Boucle_While'],
      ['fonction', 'Fonction'], ['classe', 'Classe'], ['variable', 'Variable'],
      ['async', 'Async_Await'], ['generateur', 'Generateur'], ['recursion', 'Recursion'],
      ['pointeur', 'Pointeur'], ['heritage', 'Heritage'], ['exception', 'Try_Catch'],
      ['erreur', 'Try_Catch'], ['optimis', 'Optimisation'],
    ];
    for (var j = 0; j < tousConcepts.length; j++) {
      if (q.indexOf(tousConcepts[j][0]) !== -1) conceptsDetectes.push(tousConcepts[j][1]);
    }

    if (langagesDetectes.length > 0 && conceptsDetectes.length > 0) {
      reponse = 'En ' + langagesDetectes[0] + ', voici comment utiliser ' + conceptsDetectes[0].replace(/_/g, ' ') + ' :\n\n';

      // Récupérer la syntaxe depuis le graphe
      for (var k = 0; k < langagesDetectes.length && k < 2; k++) {
        for (var l = 0; l < conceptsDetectes.length && l < 2; l++) {
          var aretes = await _db.getAllAsync(
            'SELECT a.condition, a.contexte, n2.label FROM aretes a ' +
            'JOIN noeuds n1 ON n1.id = a.source_id ' +
            'JOIN noeuds n2 ON n2.id = a.cible_id ' +
            'WHERE n1.label = ? AND a.relation = "a_pour_syntaxe" AND n2.label = ?',
            [langagesDetectes[k], conceptsDetectes[l]]
          );
          if (aretes && aretes.length > 0 && aretes[0].condition) {
            reponse += '```' + langagesDetectes[k].toLowerCase() + '\n' + aretes[0].condition + '\n```\n\n';
          }
        }
      }

      // Vérifier les warnings de performance (composition Gemini)
      if (estPerf || conceptsDetectes.indexOf('Boucle_For') !== -1) {
        var chemin = await trouverChemin('Boucle_For', 'Generateur');
        if (chemin && chemin.length > 0) {
          reponse += '⚡ **Conseil performance :** Si vous itérez sur une grande liste (>1000 éléments), ';
          if (langagesDetectes.indexOf('Python') !== -1) {
            reponse += 'utilisez un générateur Python (`yield`) pour économiser la mémoire.\n';
          } else if (langagesDetectes.indexOf('JavaScript') !== -1) {
            reponse += 'utilisez une fonction génératrice (`function*`) ou `forEach` avec break.\n';
          }
        }
      }

    } else if (conceptsDetectes.length > 0) {
      // Concept sans langage → comparaison multi-langages
      reponse = 'Voici comment ' + conceptsDetectes[0].replace(/_/g, ' ') + ' fonctionne dans les principaux langages :\n\n';
      var langagesPrincipaux = ['Python', 'JavaScript', 'Java', 'Kotlin'];
      for (var n = 0; n < langagesPrincipaux.length; n++) {
        var ar = await _db.getAllAsync(
          'SELECT a.condition FROM aretes a ' +
          'JOIN noeuds n1 ON n1.id = a.source_id ' +
          'JOIN noeuds n2 ON n2.id = a.cible_id ' +
          'WHERE n1.label = ? AND a.relation = "a_pour_syntaxe" AND n2.label = ?',
          [langagesPrincipaux[n], conceptsDetectes[0]]
        );
        if (ar && ar.length > 0 && ar[0].condition) {
          reponse += '**' + langagesPrincipaux[n] + '** : `' + ar[0].condition.split('|')[0].trim() + '`\n';
        }
      }
    } else if (langagesDetectes.length > 0) {
      // Langage sans concept → traversée générale
      var voisins = await traverser(langagesDetectes[0], 2);
      if (voisins.length > 0) {
        reponse = langagesDetectes[0] + ' est un langage que je maîtrise. Je peux vous aider avec : ';
        var concepts2 = voisins.filter(function(v) { return v.relation === 'a_pour_syntaxe'; }).slice(0, 5);
        reponse += concepts2.map(function(c) { return c.label.replace(/_/g, ' '); }).join(', ') + '.';
      }
    }
  }

  // ── CAS LOGISTIQUE ────────────────────────────────────────────────
  if (estLogistique && appData) {
    var salles    = (appData.salles    || []);
    var materiels = (appData.materiels || []);
    var now       = new Date();

    // Détecter le matériel mentionné
    var typesMat = ['Projecteur', 'Climatiseur', 'Ordinateur', 'Imprimante', 'Chaise', 'Tableau_Interactif'];
    var matDetecte = null;
    for (var ti = 0; ti < typesMat.length; ti++) {
      if (q.indexOf(typesMat[ti].toLowerCase().replace('_', ' ')) !== -1 ||
          q.indexOf(typesMat[ti].toLowerCase()) !== -1) {
        matDetecte = typesMat[ti];
        break;
      }
    }

    if (matDetecte) {
      // Traverser le graphe pour ce matériel
      var infos = await traverser(matDetecte, 3);
      if (infos.length > 0) {
        reponse += '\n📦 Analyse logistique — ' + matDetecte.replace('_', ' ') + ' :\n';

        // Durée de vie
        var dureeVie = infos.filter(function(i) { return i.relation === 'a_duree_vie'; });
        if (dureeVie.length > 0) {
          reponse += '• Durée de vie recommandée : ' + (dureeVie[0].chemin_txt.split('->').pop() || '') +
            (dureeVie[0].poids_cumul < 1 ? ' (probabilité : ' + Math.round(dureeVie[0].poids_cumul * 100) + '%)' : '') + '\n';
        }

        // Maintenance
        var maintenance = infos.filter(function(i) { return i.relation === 'nécessite'; });
        if (maintenance.length > 0) {
          reponse += '• Maintenance requise : ' + maintenance[0].label.replace('_', ' ') + '\n';
        }

        // Catégorie ABC
        var categorie = infos.filter(function(i) { return i.relation === 'appartient_à'; });
        if (categorie.length > 0) {
          reponse += '• Classification ABC : ' + categorie[0].label.replace('_', ' ') +
            ' (priorité ' + (categorie[0].label === 'Categorie_A' ? 'haute' : 'normale') + ')\n';
        }

        // Analyser les matériels réels de l'app
        var matsReels = materiels.filter(function(m) {
          return (m.category || '').toLowerCase().indexOf(matDetecte.toLowerCase().replace('_', '')) !== -1;
        });
        if (matsReels.length > 0) {
          var pannes = matsReels.filter(function(m) { return (m.etat || '').toUpperCase().indexOf('PANNE') !== -1; });
          reponse += '• Dans votre inventaire : ' + matsReels.length + ' unité(s)';
          if (pannes.length > 0) reponse += ', dont ' + pannes.length + ' en panne ⚠️';
          reponse += '\n';
        }

        // Recommandation finale (composition)
        var actions = infos.filter(function(i) { return i.relation === 'implique'; });
        if (actions.length > 0) {
          reponse += '• 💡 Recommandation : ' + actions[0].label.replace('_', ' ') + '\n';
        }
      }
    }
  }

  return reponse.trim() || null;
}

function _contient(texte, mots) {
  for (var i = 0; i < mots.length; i++) {
    if (texte.indexOf(mots[i]) !== -1) return true;
  }
  return false;
}

// ── Ajouter une connaissance externe (depuis PDF/URL converti) ────────────────

export async function ajouterConnaissance(source, relation, cible, poids, contexte, domaine) {
  if (!_db) return;
  await ajouterNoeud(source, 'CONCEPT', domaine || 'GENERAL', '');
  await ajouterNoeud(cible,  'CONCEPT', domaine || 'GENERAL', '');
  await ajouterArete(source, relation, cible, poids || 0.8, contexte || null, null);
}

// ── Stats du graphe ───────────────────────────────────────────────────────────

export async function statsGraphe() {
  if (!_db) return { noeuds: 0, aretes: 0 };
  try {
    var n = await _db.getFirstAsync('SELECT COUNT(*) as c FROM noeuds');
    var a = await _db.getFirstAsync('SELECT COUNT(*) as c FROM aretes');
    var d = await _db.getAllAsync('SELECT domaine, COUNT(*) as c FROM noeuds GROUP BY domaine');
    return {
      noeuds: (n && n.c) || 0,
      aretes: (a && a.c) || 0,
      parDomaine: d || [],
    };
  } catch(e) { return { noeuds: 0, aretes: 0, parDomaine: [] }; }
}

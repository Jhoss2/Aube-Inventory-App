import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  Image, ImageBackground, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet, StatusBar, Alert, Dimensions,
  AppState,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, CheckCheck, Trash2, Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '@/lib/app-context';
import { chatWithAubeStream } from '@/lib/aube-engine';
import { initAubeDb } from '@/lib/aube-db';
import { scanAlertes } from '@/lib/aube-notifications';
import { ouvrirCamera } from '@/lib/aube-vision';
import { apprendreAutomatiquement, lancerSessionApprentissage, statsApprentissage } from '@/lib/aube-learner';

const { width, height } = Dimensions.get('window');

// ── Composant Liquid Glass ────────────────────────────────────────────────────
function LiquidGlass({ children, style, isUser }: { children: React.ReactNode; style?: any; isUser?: boolean }) {
  return (
    <View style={[styles.glassOuter, style]}>
      {/* Calques décoratifs — pointerEvents none pour ne pas bloquer les touches */}
      <View style={styles.glassBg} pointerEvents="none" />
      <View style={[styles.glassHighlight]} pointerEvents="none" />
      <View style={styles.glassShadowBottom} pointerEvents="none" />
      <View style={[styles.glassBorder, isUser ? styles.glassBorderUser : styles.glassBorderAube]} pointerEvents="none" />
      {/* Contenu interactif au-dessus */}
      {children}
    </View>
  );
}

type UIMessage = {
  id:     string;
  sender: 'user' | 'aube';
  text:   string;
  time:   string;
};

// ── Constante EB1 — caractères invisibles (Zero Width Spaces) ────────────────
// EB1 est encodé comme séquence de caractères invisibles U+200B U+200C U+200D
// Invisible dans le champ de saisie ET dans la bulle de message
var EB1_VISIBLE   = 'EB1';
var EB1_INVISIBLE = '\u200B\u200C\u200D'; // Séquence secrète invisible

function contientEB1Invisible(texte: string): boolean {
  return texte.indexOf(EB1_INVISIBLE) !== -1;
}

function masquerEB1(texte: string): string {
  // Remplace EB1 visible par la séquence invisible
  return texte.replace(/EB1/g, EB1_INVISIBLE);
}

function nettoyerEB1(texte: string): string {
  // Retire la séquence invisible pour traitement interne
  return texte.replace(/\u200B\u200C\u200D/g, 'EB1');
}

function afficherSansEB1(texte: string): string {
  // Retire complètement EB1 et la séquence invisible pour l'affichage
  return texte
    .replace(/\u200B\u200C\u200D/g, '')
    .replace(/EB1/g, '')
    .trim();
}

export default function ChatAubeScreen() {
  const router     = useRouter();
  const appContext = useAppContext() as any;
  const { appData } = appContext;
  const flatListRef = useRef<FlatList>(null);
  const sessionRef  = useRef<string>('session-' + Date.now());

  const settings        = (appData && appData.settings) || {};
  const assistantName   = settings.assistantName   || 'AUBE';
  const assistantAvatar = settings.assistantAvatar || 'https://api.dicebear.com/7.x/bottts/png?seed=Aube&backgroundColor=f472b6';
  const userAvatar      = settings.userAvatar  || null;
  const chatBgImage     = settings.chatBgImage || null;
  const systemPrompt    = settings.aubePrompt  || "Tu es Aube, assistante experte de l'Universite Aube Nouvelle.";

  const makeWelcome = (): UIMessage => ({
    id:     '0',
    sender: 'aube',
    text:   'Salut , je suis ' + assistantName + ' l\'assistante de cette application. Je suis chargée de vous guider et de vous informer. Que puis-je faire pour vous aujourd\'hui ?',
    time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages,      setMessages]      = useState<UIMessage[]>([makeWelcome()]);
  const [inputValue,    setInputValue]    = useState('');
  const [isTyping,      setIsTyping]      = useState(false);
  const [modeCreateur,  setModeCreateur]  = useState(false);
  const historyRef    = useRef<Array<{role: string; text: string}>>([]);
  const sessionEB1Ref = useRef<string | null>(null); // session créateur active

  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    initAubeDb().catch(function() {});
    var mats = (appData && appData.materiels) || [];
    var sals = (appData && appData.salles) || [];
    if (mats.length > 0) scanAlertes(mats, sals).catch(function() {});
    // Auto-apprentissage desactive au demarrage pour preserver le quota API
    // A declencher manuellement depuis les parametres

    // Restaurer la conversation sauvegardée (historique complet 1000 tours)
    AsyncStorage.getItem('aube_conversation').then(function(saved) {
      if (saved) {
        try {
          var data = JSON.parse(saved);
          if (data.messages && data.messages.length > 1) setMessages(data.messages);
          if (data.history) historyRef.current = data.history;
          if (data.session) sessionRef.current = data.session;
        } catch(e) {}
      }
    }).catch(function() {});

    // Charger aussi l'historique long terme depuis la clé séparée
    AsyncStorage.getItem('aube_history_long').then(function(saved) {
      if (saved) {
        try {
          var longHistory = JSON.parse(saved);
          if (longHistory.length > historyRef.current.length) {
            historyRef.current = longHistory;
          }
        } catch(e) {}
      }
    }).catch(function() {});

    // Sauvegarder quand l'app passe en arrière-plan
    var sub = AppState.addEventListener('change', function(nextState) {
      if (appStateRef.current === 'active' && nextState === 'background') {
        // Sauvegarde de la conversation
        AsyncStorage.setItem('aube_conversation', JSON.stringify({
          messages: messages,
          history: historyRef.current,
          session: sessionRef.current,
          savedAt: Date.now(),
        })).catch(function() {});
      }
      appStateRef.current = nextState;
    });

    return function() { sub.remove(); };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => { if (flatListRef.current) { flatListRef.current.scrollToEnd({ animated: true }); } }, 100);
  };

  const clearConversation = () => {
    historyRef.current = [];
    sessionRef.current = 'session-' + Date.now();
    setMessages([makeWelcome()]);
    AsyncStorage.removeItem('aube_conversation').catch(function() {});
  };

  const handleLongPress = (msg: UIMessage) => {
    if (msg.id === '0') return;
    Alert.alert('Supprimer ce message ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setMessages(prev => prev.filter(m => m.id !== msg.id)) },
    ]);
  };

  // ── Mémorisation connaissance transmise par M. Belem ─────────────────────
  const _sauvegarderConnaissance = async (question: string, reponse: string) => {
    try {
      const { sauvegarderReponseGemini } = await import('@/lib/aube-semantic-cache');
      await sauvegarderReponseGemini(question, reponse || question);
    } catch(e) {}
  };

  // ── Injection automatique EB1 invisible dans le champ ────────────────────
  // Quand l'utilisateur tape "EB1", le remplacer par la séquence invisible
  const handleInputChange = (text: string) => {
    if (text.indexOf('EB1') !== -1) {
      setInputValue(masquerEB1(text));
    } else {
      setInputValue(text);
    }
  };

  const handleCamera = async () => {
    var uri = await ouvrirCamera();
    if (!uri) return;
    var now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: Date.now().toString(), sender: 'aube',
      text: 'Décris-moi le matériel visible sur la photo (nom, couleur, forme) pour que je le retrouve dans la base.',
      time: now,
    }]);
    scrollToBottom();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    const rawInput = inputValue.trim();
    const now      = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const hasEB1Vis = rawInput.indexOf('EB1') !== -1;
    const hasEB1Inv = contientEB1Invisible(rawInput);
    const hasEB1    = hasEB1Vis || hasEB1Inv;

    // Texte pour le moteur (EB1 reconstitué), texte affiché (EB1 effacé)
    const userTextMoteur  = hasEB1Inv ? nettoyerEB1(rawInput) : rawInput;
    const userTextAffiche = hasEB1    ? afficherSansEB1(rawInput) : rawInput;

    // ── Toggle mode créateur ────────────────────────────────────────────────
    if (hasEB1) {
      setInputValue('');
      if (!modeCreateur) {
        // ACTIVATION
        setModeCreateur(true);
        sessionEB1Ref.current = 'eb1-' + Date.now();
        const repId = Date.now().toString();

        if (userTextAffiche.length > 2) {
          setMessages(prev => [...prev,
            { id: (Date.now()-1).toString(), sender: 'user', text: userTextAffiche, time: now },
          ]);
        }
        setMessages(prev => [...prev,
          { id: repId, sender: 'aube',
            text: '🔓 Bonsoir Monsieur Belem. Mode créateur activé — je suis entièrement à votre service. Parlons de tout ce que vous souhaitez.',
            time: now },
        ]);
        scrollToBottom();

        // Si un message accompagne l'activation, le traiter
        if (userTextAffiche.length > 2) {
          setIsTyping(true);
          const aubeId = (Date.now()+1).toString();
          setMessages(prev => [...prev, { id: aubeId, sender: 'aube', text: '', time: now }]);
          var rep1 = '';
          await chatWithAubeStream(
            userTextMoteur, systemPrompt, appData, historyRef.current,
            function(c: string) { rep1 += c; const s = rep1; setMessages(prev => prev.map(m => m.id === aubeId ? { ...m, text: s } : m)); scrollToBottom(); },
            sessionEB1Ref.current, appContext
          );
          if (rep1) await _sauvegarderConnaissance(userTextMoteur, rep1);
          historyRef.current = [...historyRef.current, { role: 'user', text: userTextMoteur }, { role: 'model', text: rep1 }];
          setIsTyping(false);
        }
      } else {
        // DÉSACTIVATION
        setModeCreateur(false);
        sessionEB1Ref.current = null;
        setMessages(prev => [...prev,
          { id: Date.now().toString(), sender: 'aube',
            text: '🔒 Session créateur terminée. Je repasse en mode professionnel.',
            time: now },
        ]);
        scrollToBottom();
      }
      return;
    }

    // ── Mode créateur actif — conversation libre ────────────────────────────
    if (modeCreateur) {
      const uId = Date.now().toString();
      const aId = (Date.now()+1).toString();
      setMessages(prev => [...prev, { id: uId, sender: 'user', text: rawInput, time: now }]);
      setInputValue('');
      setIsTyping(true);
      setMessages(prev => [...prev, { id: aId, sender: 'aube', text: '', time: now }]);
      scrollToBottom();

      var repEB1 = '';
      await chatWithAubeStream(
        'EB1 ' + rawInput, systemPrompt, appData, historyRef.current,
        function(c: string) { repEB1 += c; const s = repEB1; setMessages(prev => prev.map(m => m.id === aId ? { ...m, text: s } : m)); scrollToBottom(); },
        sessionEB1Ref.current || sessionRef.current, appContext
      ).catch(function() {});

      // Mémoriser la connaissance transmise par M. Belem
      if (rawInput.length > 25) await _sauvegarderConnaissance(rawInput, repEB1 || '');

      historyRef.current = [...historyRef.current, { role: 'user', text: 'EB1 ' + rawInput }, { role: 'model', text: repEB1 }];
      if (historyRef.current.length > 1000) historyRef.current = historyRef.current.slice(-1000);
      AsyncStorage.setItem('aube_history_long', JSON.stringify(historyRef.current)).catch(function() {});

      setIsTyping(false);

      // Relance spontanée (20% de chances)
      if (!repEB1.endsWith('?') && Math.random() < 0.2) {
        setTimeout(function() {
          const relances = [
            'Monsieur Belem, souhaitez-vous approfondir ce sujet ou en aborder un autre ?',
            'Au fait, y a-t-il autre chose dont vous aimeriez me parler, Monsieur Belem ?',
            'Je suis curieuse, Monsieur Belem — qu\'en pensez-vous personnellement ?',
          ];
          const now2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'aube', text: relances[Math.floor(Math.random()*relances.length)], time: now2 }]);
          scrollToBottom();
        }, 3000);
      }
      return;
    }

    // ── Mode professionnel strict (sans EB1) ────────────────────────────────
    const userMsgId = Date.now().toString();
    const aubeMsgId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: rawInput, time: now }]);
    setInputValue('');
    setIsTyping(true);
    scrollToBottom();
    setMessages(prev => [...prev, { id: aubeMsgId, sender: 'aube', text: '', time: now }]);

    var fullResponse = '';
    try {
      await chatWithAubeStream(
        rawInput, systemPrompt, appData, historyRef.current,
        function(chunk: string) {
          fullResponse += chunk;
          var snap = fullResponse;
          setMessages(prev => prev.map(msg => msg.id === aubeMsgId ? { ...msg, text: snap } : msg));
          scrollToBottom();
        },
        sessionRef.current, appContext
      );
      historyRef.current = [...historyRef.current, { role: 'user', text: rawInput }, { role: 'model', text: fullResponse }];
      if (historyRef.current.length > 1000) historyRef.current = historyRef.current.slice(-1000);
      AsyncStorage.setItem('aube_history_long', JSON.stringify(historyRef.current)).catch(function() {});

      // Si pas de reponse generee, afficher un message par defaut
      if (!fullResponse || fullResponse.trim() === '') {
        setMessages(prev => prev.map(msg =>
          msg.id === aubeMsgId ? { ...msg, text: 'Je suis là ! Posez-moi votre question.' } : msg
        ));
      }
    } catch (e: any) {
      // Afficher la reponse offline plutot qu'une erreur generique
      var errMsg = fullResponse && fullResponse.trim()
        ? fullResponse
        : 'Je rencontre une difficulté technique. Réessayez dans un instant.';
      setMessages(prev => prev.map(msg =>
        msg.id === aubeMsgId ? { ...msg, text: errMsg } : msg
      ));
    }
    setIsTyping(false);
  };

  // ── Bulle de message ──────────────────────────────────────────────────────
  const renderMessage = ({ item }: { item: UIMessage }) => {
    const isAube = item.sender === 'aube';
    return (
      <TouchableOpacity activeOpacity={0.9} onLongPress={() => handleLongPress(item)} delayLongPress={500}>
        <View style={[styles.messageRow, isAube ? styles.aubeRow : styles.userRow]}>

          {/* Avatar gauche (Aube) */}
          {isAube && (
            <View style={styles.msgAvatarWrap}>
              <Image source={{ uri: assistantAvatar }} style={styles.msgAvatar} />
            </View>
          )}

          {/* Bulle Liquid Glass */}
          <View style={[styles.bubbleWrap, isAube ? styles.aubeBubbleWrap : styles.userBubbleWrap]}>
            <LiquidGlass isUser={!isAube} style={isAube ? styles.aubeBubbleRadius : styles.userBubbleRadius}>
              {isAube && item.text === '' && isTyping
                ? <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
                : <Text style={[styles.messageText, styles.SBI]}>{item.text}</Text>
              }
              {item.text !== '' && (
                <View style={styles.messageFooter}>
                  <Text style={[styles.timeText, styles.SBI]}>{item.time}</Text>
                  {!isAube && <CheckCheck size={16} color="rgba(255,255,255,0.7)" style={{ opacity: 0.8 }} />}
                </View>
              )}
            </LiquidGlass>
          </View>

          {/* Avatar droite (utilisateur) */}
          {!isAube && (
            <View style={styles.msgAvatarWrap}>
              {userAvatar
                ? <Image source={{ uri: userAvatar }} style={styles.msgAvatar} />
                : <View style={[styles.msgAvatar, styles.userAvatarFallback]}>
                    <Text style={[styles.SBI, { color: 'white', fontSize: 18 }]}>U</Text>
                  </View>
              }
            </View>
          )}

        </View>
      </TouchableOpacity>
    );
  };

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* FOND D'ÉCRAN PLEIN ÉCRAN */}
      <ImageBackground
        source={chatBgImage
          ? { uri: chatBgImage }
          : { uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000' }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Overlay très léger pour lisibilité */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >

          {/* ── HEADER Liquid Glass ── */}
          <View style={styles.headerPad}>
            <LiquidGlass style={styles.headerGlass}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                <ChevronLeft size={30} color="white" />
              </TouchableOpacity>
              <View style={styles.headerAvatarWrap}>
                <Image source={{ uri: assistantAvatar }} style={styles.headerAvatar} />
              </View>
              <View style={styles.headerCenter}>
                <Text style={[styles.headerName, styles.SBI]}>{assistantName.toUpperCase()}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, modeCreateur && { backgroundColor: '#fbbf24' }]} />
                  <Text style={[styles.statusText, styles.SBI]}>
                    {modeCreateur ? 'Session privée' : 'En ligne'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCamera} style={styles.headerBtn}>
                <Camera size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={clearConversation} style={styles.headerBtn}>
                <Trash2 size={22} color="white" />
              </TouchableOpacity>
            </LiquidGlass>
          </View>

          {/* ── LISTE DES MESSAGES ── */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderMessage}
          />

          {/* ── INPUT Liquid Glass ── */}
          <View style={styles.inputBarWrap}>
            <View style={styles.inputRow}>
              <LiquidGlass style={styles.inputGlass}>
                <TextInput
                  placeholder={'Écrire à ' + assistantName + '...'}
                  style={[styles.textInput, styles.SBI]}
                  value={inputValue}
                  onChangeText={handleInputChange}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline={true}
                  maxLength={4000}
                  scrollEnabled={true}
                  textAlignVertical="center"
                  returnKeyType="default"
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={false}
                  contextMenuHidden={false}
                  selectTextOnFocus={false}
                  editable={true}
                  autoCorrect={true}
                  autoCapitalize="sentences"
                  spellCheck={true}
                  keyboardType="default"
                  importantForAutofill="yes"
                />
              </LiquidGlass>
              <TouchableOpacity
                onPress={handleSend}
                disabled={isTyping || !inputValue.trim()}
                style={[styles.sendBtn, (!inputValue.trim() || isTyping) && styles.sendBtnDisabled]}
              >
                <LiquidGlass style={styles.sendBtnGlass}>
                  <Send size={22} color="white" />
                </LiquidGlass>
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const SBI_BASE = {
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: 'transparent' },
  overlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)' },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  SBI: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900' as const,
    fontStyle: 'italic' as const,
  },

  // ── Liquid Glass ──
  glassOuter: { position: 'relative', overflow: 'hidden' },
  glassBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.08)' },
  glassHighlight: {
    position: 'absolute', top: 0, left: '5%' as any, right: '5%' as any, height: '45%' as any,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
  },
  glassShadowBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%' as any,
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  glassBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)' },
  glassBorderAube: { borderRadius: 24, borderBottomLeftRadius: 4 },
  glassBorderUser: { borderRadius: 24, borderBottomRightRadius: 4 },

  // ── Header ──
  headerPad:   { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  headerGlass: {
    borderRadius: 30, flexDirection: 'row' as const, alignItems: 'center' as const,
    paddingVertical: 10, paddingHorizontal: 12,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  headerBtn:        { padding: 6 },
  headerAvatarWrap: {
    width: 46, height: 46, borderRadius: 23, overflow: 'hidden' as const,
    marginHorizontal: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)',
  },
  headerAvatar:  { width: '100%' as any, height: '100%' as any },
  headerCenter:  { flex: 1 },
  headerName:    { color: 'white', fontSize: 17, letterSpacing: 1 },
  statusRow:     { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 2 },
  statusDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 5 },
  statusText:    { color: 'rgba(255,255,255,0.9)', fontSize: 11 },

  // ── Messages ──
  listContent:  { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  messageRow:   { flexDirection: 'row' as const, marginBottom: 18, alignItems: 'flex-end' as const },
  aubeRow:      { justifyContent: 'flex-start' as const },
  userRow:      { justifyContent: 'flex-end' as const },
  msgAvatarWrap: {
    width: 52, height: 52, borderRadius: 26, overflow: 'hidden' as const,
    marginHorizontal: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  msgAvatar:          { width: '100%' as any, height: '100%' as any },
  userAvatarFallback: { backgroundColor: 'rgba(26,35,126,0.6)', justifyContent: 'center' as const, alignItems: 'center' as const },
  bubbleWrap:         { maxWidth: '72%' as any },
  aubeBubbleWrap:     {},
  userBubbleWrap:     {},
  aubeBubbleRadius:   { borderRadius: 24, borderBottomLeftRadius: 4 },
  userBubbleRadius:   { borderRadius: 24, borderBottomRightRadius: 4 },
  messageText:        { fontSize: 17, color: 'white', lineHeight: 25, letterSpacing: 0.2, padding: 16 },
  messageFooter:      { flexDirection: 'row' as const, justifyContent: 'flex-end' as const, alignItems: 'center' as const, paddingHorizontal: 16, paddingBottom: 10, gap: 5, marginTop: -4 },
  timeText:           { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // ── Input ──
  inputBarWrap: { paddingHorizontal: 14, paddingVertical: 10 },
  inputRow:     { flexDirection: 'row' as const, alignItems: 'flex-end' as const, gap: 10 },
  inputGlass: {
    flex: 1, borderRadius: 50,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  textInput: {
    flex: 1, fontSize: 17, color: 'white',
    paddingHorizontal: 18, paddingVertical: 12, minHeight: 48, maxHeight: 140,
  },
  sendBtn: {
    width: 50, height: 50, borderRadius: 25, overflow: 'hidden' as const,
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  sendBtnGlass: {
    borderRadius: 25, width: 50, height: 50,
    justifyContent: 'center' as const, alignItems: 'center' as const,
  },
  sendBtnDisabled: { opacity: 0.35 },
});

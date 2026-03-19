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
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '@/lib/app-context';
import { chatWithAubeStream } from '@/lib/aube-engine';
import { initAubeDb } from '@/lib/aube-db';
import { scanAlertes } from '@/lib/aube-notifications';
import { ouvrirCamera } from '@/lib/aube-vision';
import { apprendreAutomatiquement, lancerSessionApprentissage, statsApprentissage } from '@/lib/aube-learner';

const { width, height } = Dimensions.get('window');

type UIMessage = {
  id:     string;
  sender: 'user' | 'aube';
  text:   string;
  time:   string;
};

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

  const [messages,   setMessages]   = useState<UIMessage[]>([makeWelcome()]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const historyRef = useRef<Array<{role: string; text: string}>>([]);

  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    initAubeDb().catch(function() {});
    var mats = (appData && appData.materiels) || [];
    var sals = (appData && appData.salles) || [];
    if (mats.length > 0) scanAlertes(mats, sals).catch(function() {});

    // Déclencher l'auto-apprentissage en arrière-plan au démarrage
    apprendreAutomatiquement(appData).catch(function() {});

    // Restaurer la conversation sauvegardée
    AsyncStorage.getItem('aube_conversation').then(function(saved) {
      if (saved) {
        try {
          var data = JSON.parse(saved);
          if (data.messages && data.messages.length > 1) {
            setMessages(data.messages);
          }
          if (data.history) historyRef.current = data.history;
          if (data.session) sessionRef.current = data.session;
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
    const userText  = inputValue.trim();
    const now       = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Commande EB1 : déclencher l'apprentissage manuellement
    if (userText.indexOf('EB1') !== -1 && (userText.toLowerCase().indexOf('apprend') !== -1 || userText.toLowerCase().indexOf('appren') !== -1 || userText.toLowerCase().indexOf('formation') !== -1)) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText, time: now }]);
      setInputValue('');
      setIsTyping(true);
      const trigMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: trigMsgId, sender: 'aube', text: 'Session d\'apprentissage déclenchée... Je contacte Gemini pour combler mes lacunes.', time: now }]);
      scrollToBottom();

      await initLearnerDb();
      const settings2 = (appData && appData.settings) || {};
      const key = settings2.geminiApiKey || '';

      await lancerSessionApprentissage(key, appData, function(progress: any) {
        setMessages(prev => prev.map(msg =>
          msg.id === trigMsgId ? { ...msg, text: progress.message || '...' } : msg
        ));
        scrollToBottom();
      });
      setIsTyping(false);
      return;
    }

    // Commande EB1 : stats apprentissage
    if (userText.indexOf('EB1') !== -1 && userText.toLowerCase().indexOf('stat') !== -1) {
      await initLearnerDb();
      const stats = await statsApprentissage();
      const statMsg = 'Statistiques d\'apprentissage :\n\n📚 Leçons apprises : ' + stats.lecons + '\n❓ Lacunes en attente : ' + stats.lacunes + '\n🎓 Sessions terminées : ' + stats.sessions;
      setMessages(prev => [...prev,
        { id: Date.now().toString(), sender: 'user', text: userText, time: now },
        { id: (Date.now()+1).toString(), sender: 'aube', text: statMsg, time: now },
      ]);
      setInputValue('');
      return;
    }
    const userMsgId = Date.now().toString();
    const aubeMsgId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userText, time: now }]);
    setInputValue('');
    setIsTyping(true);
    scrollToBottom();
    setMessages(prev => [...prev, { id: aubeMsgId, sender: 'aube', text: '', time: now }]);

    var fullResponse = '';
    try {
      await chatWithAubeStream(
        userText, systemPrompt, appData, historyRef.current,
        function(chunk: string) {
          fullResponse += chunk;
          var snap = fullResponse;
          setMessages(prev => prev.map(msg => msg.id === aubeMsgId ? { ...msg, text: snap } : msg));
          scrollToBottom();
        },
        sessionRef.current, appContext
      );
      historyRef.current = [...historyRef.current, { role: 'user', text: userText }, { role: 'model', text: fullResponse }];
      if (historyRef.current.length > 40) historyRef.current = historyRef.current.slice(-40);

      AsyncStorage.setItem('aube_conversation', JSON.stringify({
        messages: messages,
        history: historyRef.current,
        session: sessionRef.current,
        savedAt: Date.now(),
      })).catch(function() {});

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

          {/* Bulle glass */}
          <View style={[styles.bubbleWrap, isAube ? styles.aubeBubbleWrap : styles.userBubbleWrap]}>
            <View style={[styles.bubble, isAube ? styles.aubeBubble : styles.userBubble]}>
              {isAube && item.text === '' && isTyping
                ? <ActivityIndicator size="small" color="#1A237E" />
                : <Text style={[styles.messageText, styles.SBI]}>{item.text}</Text>
              }
              {item.text !== '' && (
                <View style={styles.messageFooter}>
                  <Text style={[styles.timeText, styles.SBI]}>{item.time}</Text>
                  {!isAube && <CheckCheck size={16} color="#0a0a2a" style={{ opacity: 0.6 }} />}
                </View>
              )}
            </View>
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

          {/* ── HEADER TRANSPARENT avec avatar ── */}
          <View style={styles.headerPad}>
            <View style={styles.headerBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                <ChevronLeft size={30} color="white" />
              </TouchableOpacity>
              <View style={styles.headerAvatarWrap}>
                <Image source={{ uri: assistantAvatar }} style={styles.headerAvatar} />
              </View>
              <View style={styles.headerCenter}>
                <Text style={[styles.headerName, styles.SBI]}>{assistantName.toUpperCase()}</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={[styles.statusText, styles.SBI]}>En ligne</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCamera} style={styles.headerBtn}>
                <Camera size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={clearConversation} style={styles.headerBtn}>
                <Trash2 size={22} color="white" />
              </TouchableOpacity>
            </View>
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

          {/* ── INPUT GLASS ── */}
          <View style={styles.inputBar}>
            <View style={styles.inputInner}>
              <TextInput
                placeholder={'Écrire à ' + assistantName + '...'}
                style={[styles.textInput, styles.SBI]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholderTextColor="rgba(10,10,42,0.4)"
                multiline={false}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={isTyping || !inputValue.trim()}
                style={[styles.sendBtn, (!inputValue.trim() || isTyping) && styles.sendBtnDisabled]}
              >
                <Send size={24} color="white" />
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
  root:    { flex: 1, backgroundColor: '#1A237E' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)' },
  safeArea:{ flex: 1, backgroundColor: 'transparent' },

  SBI: { ...SBI_BASE },

  // ── Header ──
  headerPad:  { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerBtn:        { padding: 6 },
  headerAvatarWrap: {
    width: 50, height: 50, borderRadius: 25,
    overflow: 'hidden', marginHorizontal: 10,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  headerAvatar:  { width: '100%', height: '100%' },
  headerCenter:  { flex: 1 },
  headerName:    { color: 'white', fontSize: 18, letterSpacing: 1 },
  statusRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 5 },
  statusText:    { color: 'rgba(255,255,255,0.85)', fontSize: 12 },

  // ── Messages ──
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  aubeRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },

  msgAvatarWrap: {
    width: 64, height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  msgAvatar: { width: '100%', height: '100%' },
  userAvatarFallback: { backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center' },

  bubbleWrap:     { maxWidth: '72%' },
  aubeBubbleWrap: {},
  userBubbleWrap: {},

  bubble: {
    borderRadius: 28,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  aubeBubble: {
    borderBottomLeftRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  userBubble: {
    borderBottomRightRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  messageText:   { fontSize: 18, color: '#0a0a2a', lineHeight: 26, letterSpacing: 0.2 },
  messageFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, gap: 6 },
  timeText:      { fontSize: 12, color: 'rgba(10,10,42,0.5)' },

  // ── Input ──
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#0a0a2a',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    minHeight: 56,
  },
  sendBtn: {
    width: 56, height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(26,35,126,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#1A237E', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  sendBtnBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
                                          

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  Image, ImageBackground, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, CheckCheck, Trash2, Camera } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';
import { chatWithAubeStream } from '@/lib/aube-engine';
import { initAubeDb } from '@/lib/aube-db';
import { scanAlertes } from '@/lib/aube-notifications';
import { ouvrirCamera, rechercherParDescription, formaterResultats } from '@/lib/aube-vision';

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
  const assistantName   = settings.assistantName   || 'Aube';
  const assistantAvatar = settings.assistantAvatar || 'https://api.dicebear.com/7.x/bottts/png?seed=Aube&backgroundColor=f472b6';
  const userAvatar      = settings.userAvatar  || null;
  const chatBgImage     = settings.chatBgImage || null;
  const systemPrompt    = settings.aubePrompt  || "Tu es Aube, assistante experte de l'Universite Aube Nouvelle.";

  const makeWelcome = (): UIMessage => ({
    id:     '0',
    sender: 'aube',
    text:   'Bonjour ! Je suis ' + assistantName + '. Je connais toutes les données de vos salles et matériels. Comment puis-je vous aider ?',
    time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages,   setMessages]   = useState<UIMessage[]>([makeWelcome()]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const historyRef = useRef<Array<{role: string; text: string}>>([]);

  useEffect(() => {
    initAubeDb().catch(function() {});
    var mats = (appData && appData.materiels) || [];
    var sals = (appData && appData.salles) || [];
    if (mats.length > 0) scanAlertes(mats, sals).catch(function() {});
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => { if (flatListRef.current) { flatListRef.current.scrollToEnd({ animated: true }); } }, 100);
  };

  const clearConversation = () => {
    historyRef.current = [];
    sessionRef.current = 'session-' + Date.now();
    setMessages([makeWelcome()]);
  };

  const handleLongPress = (msg: UIMessage) => {
    if (msg.id === '0') return;
    Alert.alert('Supprimer ce message ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setMessages(prev => prev.filter(m => m.id !== msg.id)) },
    ]);
  };

  const handleCamera = async () => {
    var mats = (appData && appData.materiels) || [];
    var sals = (appData && appData.salles) || [];
    var uri  = await ouvrirCamera();
    if (!uri) return;
    var now     = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var msgId   = Date.now().toString();
    var rep     = 'Analyse la photo et decris le materiel visible (couleur, forme, nom) pour que je le retrouve dans la base.';
    setMessages(prev => [...prev, { id: msgId, sender: 'aube', text: rep, time: now }]);
    scrollToBottom();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText  = inputValue.trim();
    const now       = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        sessionRef.current,
        appContext
      );

      historyRef.current = [...historyRef.current, { role: 'user', text: userText }, { role: 'model', text: fullResponse }];
      if (historyRef.current.length > 40) historyRef.current = historyRef.current.slice(-40);

    } catch (e: any) {
      setMessages(prev => prev.map(msg =>
        msg.id === aubeMsgId ? { ...msg, text: 'Une erreur est survenue. Verifie ta connexion.' } : msg
      ));
    }
    setIsTyping(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.headerPadding}>
        <View style={[styles.redHeaderPill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: assistantAvatar }} style={styles.avatarImg} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.assistantTitle, styles.SBI]}>{assistantName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusText, styles.SBI]}>En ligne · données synchronisées</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleCamera} style={styles.clearBtn}>
            <Camera size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearConversation} style={styles.clearBtn}>
            <Trash2 size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CHAT */}
      <ImageBackground
        source={chatBgImage
          ? { uri: chatBgImage }
          : { uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }}
        imageStyle={{ opacity: chatBgImage ? 0.25 : 0.03 }}
        style={styles.chatBackground}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.aubeRow]}>

                {item.sender === 'aube' && (
                  <View style={styles.msgAvatar}>
                    <Image source={{ uri: assistantAvatar }} style={styles.msgAvatarImg} />
                  </View>
                )}

                <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aubeBubble, styles.glowLight]}>
                  {item.sender === 'aube' && item.text === '' && isTyping
                    ? <ActivityIndicator size="small" color="#8B0000" />
                    : <Text style={[styles.messageText, styles.SBI]}>{item.text}</Text>
                  }
                  {item.text !== '' && (
                    <View style={styles.messageFooter}>
                      <Text style={[styles.timeText, styles.SBI]}>{item.time}</Text>
                      {item.sender === 'user' && <CheckCheck size={14} color="#1A237E" style={{ opacity: 0.8 }} />}
                    </View>
                  )}
                </View>

                {item.sender === 'user' && (
                  <View style={styles.msgAvatar}>
                    {userAvatar
                      ? <Image source={{ uri: userAvatar }} style={styles.msgAvatarImg} />
                      : <View style={[styles.msgAvatarImg, { backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={[styles.SBI, { color: 'white', fontSize: 12 }]}>U</Text>
                        </View>
                    }
                  </View>
                )}

              </View>
            </TouchableOpacity>
          )}
        />
      </ImageBackground>

      {/* INPUT */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        <View style={styles.inputContainer}>
          <View style={[styles.textInputWrapper, styles.glowLight]}>
            <TextInput
              placeholder={'Écrire à ' + assistantName + '...'}
              style={[styles.textInput, styles.SBI]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholderTextColor="#94A3B8"
              multiline={false}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={isTyping || !inputValue.trim()}
            style={[styles.sendBtn, styles.glow, (!inputValue.trim() || isTyping) && styles.sendBtnDisabled]}
          >
            <Send size={22} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  SBI: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },
  headerPadding: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
  redHeaderPill: {
    backgroundColor: '#8B0000', borderRadius: 50,
    paddingVertical: 10, paddingHorizontal: 15,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn:        { padding: 5 },
  avatarContainer:{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', overflow: 'hidden', marginLeft: 10 },
  avatarImg:      { width: '100%', height: '100%' },
  headerInfo:     { flex: 1, marginLeft: 12 },
  assistantTitle: { color: 'white', fontSize: 14 },
  statusRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 5 },
  statusText:     { color: 'rgba(255,255,255,0.9)', fontSize: 11 },
  clearBtn:       { padding: 8, marginLeft: 4 },
  chatBackground: { flex: 1 },
  listContent:    { padding: 20, paddingBottom: 30 },
  messageRow:     { flexDirection: 'row', marginBottom: 18, alignItems: 'flex-end' },
  userRow:        { justifyContent: 'flex-end' },
  aubeRow:        { justifyContent: 'flex-start' },
  msgAvatar:      { width: 32, height: 32, borderRadius: 16, marginHorizontal: 6, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  msgAvatarImg:   { width: '100%', height: '100%', borderRadius: 16 },
  bubble:         { maxWidth: '78%', padding: 16, borderRadius: 25 },
  userBubble:     { backgroundColor: '#E0E7FF', borderBottomRightRadius: 4, borderWidth: 1.5, borderColor: '#C7D2FE' },
  aubeBubble:     { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1.5, borderColor: '#F1F5F9' },
  messageText:    { fontSize: 15, color: '#1E293B', lineHeight: 22, letterSpacing: 0.3 },
  messageFooter:  { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 6, gap: 5 },
  timeText:       { fontSize: 11, color: '#64748B' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  textInputWrapper: { flex: 1, backgroundColor: 'white', borderRadius: 50, paddingHorizontal: 20, height: 55, justifyContent: 'center', borderWidth: 1.5, borderColor: '#FCE7F3' },
  textInput:      { color: '#1A237E', fontSize: 13, letterSpacing: 1 },
  sendBtn:        { width: 55, height: 55, backgroundColor: '#1A237E', borderRadius: 27.5, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sendBtnDisabled:{ backgroundColor: '#94A3B8', elevation: 0 },
  glow:           { elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  glowLight:      { elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
});

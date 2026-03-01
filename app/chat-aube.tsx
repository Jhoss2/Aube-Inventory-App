import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  StyleSheet,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, CheckCheck } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';
// @ts-ignore
import { chatWithAubeStream } from '@/lib/aube-engine';

export default function ChatAubeScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;
  const flatListRef = useRef<FlatList>(null);

  const assistantName = appData?.settings?.assistantName || "Aube";
  const assistantAvatar = appData?.settings?.assistantAvatar || "https://api.dicebear.com/7.x/bottts/png?seed=Aube&backgroundColor=f472b6";
  const systemPrompt = appData?.settings?.aubePrompt || "Tu es Aube, assistant expert de l'Université AUBEN.";

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'aube',
      text: `Bonjour ! Je suis ${assistantName}. Comment puis-je vous aider aujourd'hui ?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsgId = Date.now().toString();
    
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    scrollToBottom();

    const aubeMsgId = (Date.now() + 1).toString();
    const initialAubeMsg = {
      id: aubeMsgId,
      sender: 'aube',
      text: "",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, initialAubeMsg]);

    try {
        await chatWithAubeStream(userText, systemPrompt, (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aubeMsgId ? { ...msg, text: msg.text + chunk } : msg
          ));
          scrollToBottom();
        });
    } catch (e) {
        console.error(e);
    }

    setIsTyping(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER ROUGE PILL SHAPE */}
      <View style={styles.headerPadding}>
        <View style={styles.redHeaderPill}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.avatarContainer}>
            <Image source={{ uri: assistantAvatar }} style={styles.avatarImg} />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.assistantTitle}>{assistantName.toUpperCase()}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>EN LIGNE</Text>
            </View>
          </View>
          <View style={{ width: 20 }} />
        </View>
      </View>

      <ImageBackground 
        source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }}
        imageStyle={{ opacity: 0.03 }}
        style={styles.chatBackground}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.aubeRow]}>
              <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aubeBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <View style={styles.messageFooter}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  {item.sender === 'user' && <CheckCheck size={14} color="#1A237E" style={{opacity: 0.6}} />}
                </View>
              </View>
            </View>
          )}
        />
        {isTyping && (
           <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#8B0000" />
           </View>
        )}
      </ImageBackground>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.textInputWrapper}>
            <TextInput 
              placeholder={`Écrire à ${assistantName}...`}
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholderTextColor="#94A3B8"
              multiline={false}
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
            style={[styles.sendBtn, (!inputValue.trim() || isTyping) && styles.sendBtnDisabled]}
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
  headerPadding: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
  
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    borderRadius: 50, 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  backBtn: { padding: 5 },
  avatarContainer: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: 'white', 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    marginLeft: 10
  },
  avatarImg: { width: '100%', height: '100%' },
  headerInfo: { flex: 1, marginLeft: 12 },
  assistantTitle: { color: 'white', fontWeight: '900', fontSize: 13, letterSpacing: 1.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 5 },
  statusText: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 'bold' },

  chatBackground: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 30 },
  
  messageRow: { flexDirection: 'row', marginBottom: 18 },
  userRow: { justifyContent: 'flex-end' },
  aubeRow: { justifyContent: 'flex-start' },
  
  bubble: { 
    maxWidth: '85%', 
    padding: 15, 
    borderRadius: 25, 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  userBubble: { 
    backgroundColor: '#E0E7FF', 
    borderBottomRightRadius: 4, 
    borderWidth: 1, 
    borderColor: '#C7D2FE' 
  },
  aubeBubble: { 
    backgroundColor: 'white', 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: '#F1F5F9' 
  },
  
  messageText: { fontSize: 14, fontWeight: '600', color: '#1E293B', lineHeight: 20 },
  messageFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 6, gap: 5 },
  timeText: { fontSize: 9, fontWeight: 'bold', color: '#64748B' },
  
  typingIndicator: { marginLeft: 25, marginBottom: 20 },

  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: 'transparent'
  },
  textInputWrapper: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 50, 
    paddingHorizontal: 20, 
    height: 55, 
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FCE7F3'
  },
  textInput: { color: '#1A237E', fontWeight: 'bold', fontSize: 14 },
  sendBtn: { 
    width: 55, 
    height: 55, 
    backgroundColor: '#1A237E', 
    borderRadius: 27.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 12,
    elevation: 6
  },
  sendBtnDisabled: { backgroundColor: '#94A3B8', elevation: 0 }
});

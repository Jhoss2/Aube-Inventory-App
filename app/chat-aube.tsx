import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, FlatList, 
  Image, ImageBackground, KeyboardAvoidingView, 
  Platform, ActivityIndicator, StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';
import { chatWithAubeStream } from '@/lib/aube-engine';

export default function ChatAubeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const flatListRef = useRef<FlatList>(null);

  // Paramètres dynamiques définis dans l'écran Paramètres
  const assistantName = appData.settings?.assistantName || "Aube";
  const assistantAvatar = appData.settings?.assistantAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Aube&backgroundColor=f472b6";
  const systemPrompt = appData.settings?.aubePrompt || "Tu es Aube, assistant expert de l'Université AUBEN.";

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'aube',
      text: `Bonjour ! Je suis ${assistantName}. Comment puis-je vous aider ?`,
      time: "20:14"
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
    
    // Ajouter le message de l'utilisateur
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

    // Créer une bulle vide pour Aube qui va se remplir (Streaming)
    const aubeMsgId = (Date.now() + 1).toString();
    const initialAubeMsg = {
      id: aubeMsgId,
      sender: 'aube',
      text: "",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, initialAubeMsg]);

    // Lancer le moteur avec streaming
    await chatWithAubeStream(userText, systemPrompt, (chunk) => {
      setMessages(prev => prev.map(msg => 
        msg.id === aubeMsgId ? { ...msg, text: msg.text + chunk } : msg
      ));
      scrollToBottom();
    });

    setIsTyping(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDF2F8' }}>
      
      {/* Header Rouge Arrondi */}
      <View className="px-3 pt-2 pb-2">
        <View className="bg-[#B21F18] rounded-full py-2 px-4 flex-row items-center shadow-lg">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="w-10 h-10 rounded-full bg-pink-300 overflow-hidden border-2 border-white/20 ml-2">
            <Image source={{ uri: assistantAvatar }} className="w-full h-full" />
          </View>

          <View className="flex-1 ml-3">
            <Text className="font-black text-sm text-white uppercase">{assistantName}</Text>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
              <Text className="text-[10px] font-bold text-white/80">En ligne</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Zone de Chat avec fond texturé */}
      <ImageBackground 
        source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }}
        imageStyle={{ opacity: 0.05 }}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.row, item.sender === 'user' ? styles.userRow : styles.aubeRow]}>
              <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aubeBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <View className="flex-row justify-end items-center mt-1">
                  <Text style={styles.timeText}>{item.time}</Text>
                  {item.sender === 'user' && <Ionicons name="checkmark-done" size={14} color="#000" style={{opacity: 0.5}} />}
                </View>
                <View style={[styles.triangle, item.sender === 'user' ? styles.userTriangle : styles.aubeTriangle]} />
              </View>
            </View>
          )}
        />
        {isTyping && (
           <View className="ml-6 mb-4">
              <ActivityIndicator size="small" color="#B21F18" />
           </View>
        )}
      </ImageBackground>

      {/* Barre d'envoi */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View className="flex-row items-center px-4 py-6">
          <View className="flex-1 bg-white rounded-full px-5 py-3 shadow-lg border border-pink-100">
            <TextInput 
              placeholder={`Écrire à ${assistantName}...`}
              className="text-black text-sm font-bold"
              value={inputValue}
              onChangeText={setInputValue}
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
            className="w-14 h-14 bg-[#1D3583] rounded-full items-center justify-center ml-2 shadow-xl"
          >
            <Ionicons name="send" size={22} color="white" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 15 },
  userRow: { justifyContent: 'flex-end' },
  aubeRow: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%', padding: 12, borderRadius: 18, position: 'relative',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  userBubble: { backgroundColor: '#E9D5FF', borderTopRightRadius: 0 },
  aubeBubble: { backgroundColor: '#FBCFE8', borderTopLeftRadius: 0 },
  messageText: { fontSize: 14, fontWeight: '700', color: '#000' },
  timeText: { fontSize: 9, fontWeight: '700', opacity: 0.5, marginRight: 4 },
  triangle: { position: 'absolute', top: 0, width: 10, height: 10 },
  userTriangle: { right: -5, backgroundColor: '#E9D5FF', borderBottomLeftRadius: 10 },
  aubeTriangle: { left: -5, backgroundColor: '#FBCFE8', borderBottomRightRadius: 10 }
});


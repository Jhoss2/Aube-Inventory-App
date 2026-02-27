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
  StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context'; // Pour le profil dynamique

export default function ChatAubeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const flatListRef = useRef<FlatList>(null);

  // Récupération des infos d'Aube depuis les paramètres
  const assistantName = appData.settings?.assistantName || "Aube";
  const assistantAvatar = appData.settings?.assistantAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Aube&backgroundColor=f472b6";

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'aube',
      text: `Bonjour ! Je suis ${assistantName}, votre assistant. Comment puis-je vous aider ?`,
      time: "20:14"
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Simulation d'une réponse automatique après 1s (Optionnel)
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: typeof messages[0] }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aubeRow]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aubeBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{item.time}</Text>
            {isUser && <Ionicons name="checkmark-done" size={14} color="black" style={{ opacity: 0.6 }} />}
          </View>
          
          {/* Petit triangle style WhatsApp */}
          <View style={[styles.triangle, isUser ? styles.userTriangle : styles.aubeTriangle]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDF2F8' }}>
      
      {/* HEADER ROUGE ARRONDI */}
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
            <Text className="text-[10px] font-bold text-white/80">En ligne</Text>
          </View>
        </View>
      </View>

      {/* ZONE DE CHAT */}
      <ImageBackground 
        source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }}
        imageStyle={{ opacity: 0.05 }}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      </ImageBackground>

      {/* BARRE DE SAISIE */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-row items-center px-4 py-6">
          <View className="flex-1 bg-white rounded-full px-5 py-3 shadow-lg border border-pink-100">
            <TextInput 
              placeholder={`Écrire à ${assistantName}...`}
              className="text-black text-sm font-bold h-6"
              value={inputValue}
              onChangeText={setInputValue}
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleSendMessage}
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
  messageRow: { flexDirection: 'row', marginBottom: 16 },
  userRow: { justifyContent: 'flex-end' },
  aubeRow: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userBubble: { backgroundColor: '#E9D5FF', borderTopRightRadius: 0 },
  aubeBubble: { backgroundColor: '#FBCFE8', borderTopLeftRadius: 0 },
  messageText: { fontSize: 14, fontWeight: 'bold', color: 'black', lineHeight: 20 },
  timeContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 9, fontWeight: 'bold', color: 'black', opacity: 0.6, marginRight: 4 },
  triangle: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
  },
  userTriangle: {
    right: -5,
    backgroundColor: '#E9D5FF',
    borderBottomLeftRadius: 10, // Simule le clip-path polygon
  },
  aubeTriangle: {
    left: -5,
    backgroundColor: '#FBCFE8',
    borderBottomRightRadius: 10,
  }
});

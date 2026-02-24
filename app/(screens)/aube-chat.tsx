import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aube';
  timestamp: Date;
}

export default function AubeChatScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `msg-${new Date().getTime()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let aubeResponse = '';

      if (isOnline) {
        // Online mode: Use Google GenAI
        aubeResponse = await getAubeResponseOnline(inputText);
      } else {
        // Offline mode: Keyword search
        aubeResponse = getAubeResponseOffline(inputText);
      }

      const aubeMessage: Message = {
        id: `msg-${new Date().getTime()}-aube`,
        text: aubeResponse,
        sender: 'aube',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aubeMessage]);
    } catch (error) {
      console.error('Error getting Aube response:', error);
      const errorMessage: Message = {
        id: `msg-${new Date().getTime()}-error`,
        text: 'Erreur lors de la communication avec Aube',
        sender: 'aube',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAubeResponseOnline = async (query: string): Promise<string> => {
    // Placeholder for Google GenAI integration
    // In production, this would call the Google Generative AI API
    return `[En ligne] Aube a reçu votre question: "${query}". Réponse générée par IA...`;
  };

  const getAubeResponseOffline = (query: string): string => {
    const queryLower = query.toLowerCase();

    // Search in Aube KB
    if (appData.aube.kb.toLowerCase().includes(queryLower)) {
      return `[Hors ligne] Trouvé dans la base de connaissances: ${appData.aube.kb}`;
    }

    // Search in inventory
    const matchingItems = appData.materiel.filter((item) =>
      item.nom.toLowerCase().includes(queryLower) || item.categorie?.toLowerCase().includes(queryLower)
    );

    if (matchingItems.length > 0) {
      const itemsList = matchingItems.map((item) => `- ${item.nom} (${item.categorie})`).join('\n');
      return `[Hors ligne] Matériel trouvé:\n${itemsList}`;
    }

    return '[Hors ligne] Aucune information trouvée pour cette requête.';
  };

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-gray-700 font-semibold">Aube AI</Text>
          <View className="flex-row items-center mt-1">
            <View className={`w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
            <Text className="text-xs text-gray-600">{isOnline ? 'En ligne' : 'Hors ligne'}</Text>
          </View>
        </View>
        <View className="w-10"></View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="chatbubble" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Commencez une conversation avec Aube</Text>
          </View>
        ) : (
          <View className="gap-3">
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <View
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.sender === 'user' ? 'bg-blue-600' : 'bg-white border border-gray-300'
                  }`}
                >
                  <Text className={msg.sender === 'user' ? 'text-white' : 'text-gray-800'}>{msg.text}</Text>
                  <Text className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}

            {isLoading && (
              <View className="flex-row justify-start">
                <View className="bg-white border border-gray-300 rounded-lg p-3">
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="flex-row gap-2 mt-4 pt-3 border-t border-gray-200">
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Posez une question..."
          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={isLoading || !inputText.trim()}
          className="bg-blue-600 rounded-lg p-3 items-center justify-center"
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

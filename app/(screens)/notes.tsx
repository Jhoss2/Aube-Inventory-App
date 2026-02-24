import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotesScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return appData.notes
      .filter((n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appData.notes, searchQuery]);

  const handleCreateNote = () => {
    router.push('/screens/note-editor');
  };

  const handleOpenNote = (noteId: string) => {
    router.push({ pathname: '/screens/note-editor', params: { noteId } });
  };

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <Text className="text-gray-700 font-semibold">Notes</Text>
        <TouchableOpacity onPress={handleCreateNote} className="p-2">
          <Ionicons name="add-circle" size={28} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="relative mb-4">
        <View className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex-row items-center">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-800"
          />
        </View>
      </View>

      {/* Notes List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredNotes.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="document-text" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Aucune note</Text>
          </View>
        ) : (
          <View className="gap-2">
            {filteredNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                onPress={() => handleOpenNote(note.id)}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-400"
              >
                <Text className="text-gray-800 font-bold truncate">{note.title || 'Sans titre'}</Text>
                <Text className="text-gray-600 text-xs mt-1">{new Date(note.date).toLocaleDateString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

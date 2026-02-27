import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { appData, addNote, updateNote, deleteNote } = useAppContext();

  const existingNote = noteId ? appData.notes.find((n) => n.id === noteId) : null;

  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }

    if (noteId && existingNote) {
      await updateNote(noteId, {
        title: title.trim(),
        content: content.trim(),
        date: new Date().toISOString(),
      });
    } else {
      await addNote({
        id: `note-${new Date().getTime()}`,
        title: title.trim(),
        content: content.trim(),
        date: new Date().toISOString(),
      });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!noteId) return;

    Alert.alert('Supprimer la note', 'Êtes-vous sûr ?', [
      { text: 'Annuler' },
      {
        text: 'Supprimer',
        onPress: async () => {
          await deleteNote(noteId);
          router.back();
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-gray-700 font-semibold">Éditeur de note</Text>
        {noteId && (
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Ionicons name="trash" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="bg-white rounded-xl p-4 shadow-sm gap-4">
          <View>
            <Text className="text-gray-800 font-semibold mb-2">Titre</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de la note"
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            />
          </View>

          <View>
            <Text className="text-gray-800 font-semibold mb-2">Contenu</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Contenu de la note"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            />
          </View>

          <TouchableOpacity onPress={handleSave} className="bg-blue-600 rounded-lg py-3 items-center mt-4">
            <Text className="text-white font-semibold">Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}


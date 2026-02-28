import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
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
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Éditeur de note</Text>
        {noteId ? (
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash" size={24} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} /> /* Spacer pour garder le titre centré */
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de la note"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contenu</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Contenu de la note"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={[styles.input, styles.textArea]}
            />
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fde7f3',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  iconButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#1f2937',
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

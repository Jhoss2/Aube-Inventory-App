import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function NoteEditorScreen() {
  const router = useRouter();
  const context = useAppContext();
  const { appData, addNote, updateNote, deleteNote } = context as any;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const notes = useMemo(() => {
    return (appData?.notes || []).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [appData?.notes]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      if (editingId) resetForm();
      return;
    }
    try {
      if (editingId) {
        await updateNote(editingId, { title: title.trim(), content: content.trim(), date: new Date().toISOString() });
      } else {
        await addNote({ id: `note-${Date.now()}`, title: title.trim(), content: content.trim(), date: new Date().toISOString() });
      }
      resetForm();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer la note.");
    }
  };

  const resetForm = () => { setEditingId(null); setTitle(''); setContent(''); };
  const startEdit = (note: any) => { setEditingId(note.id); setTitle(note.title); setContent(note.content); };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MES NOTES</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorMode}>{editingId ? "MODIFICATION" : "NOUVELLE NOTE"}</Text>
            {editingId && <TouchableOpacity onPress={resetForm}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity>}
          </View>
          <TextInput value={title} onChangeText={setTitle} placeholder="Titre..." style={styles.inputTitle} />
          <TextInput value={content} onChangeText={setContent} placeholder="Écrire..." multiline style={styles.inputContent} textAlignVertical="top" />
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{editingId ? "METTRE À JOUR" : "ENREGISTRER"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Historique ({notes.length})</Text>
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.noteItem, editingId === item.id && styles.noteItemActive]} onPress={() => startEdit(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title || "Sans titre"}</Text>
                  <Text style={styles.itemContent} numberOfLines={1}>{item.content}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: 'white' },
  backBtn: { paddingHorizontal: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '900', color: '#1D3583', fontSize: 18 },
  editorCard: { backgroundColor: 'white', margin: 16, borderRadius: 25, padding: 16, elevation: 4 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  editorMode: { fontSize: 10, fontWeight: 'bold', color: '#B21F18' },
  cancelText: { fontSize: 10, fontWeight: 'bold', color: '#6b7280' },
  inputTitle: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8 },
  inputContent: { fontSize: 14, minHeight: 80, maxHeight: 150, paddingTop: 10 },
  saveBtn: { backgroundColor: '#1D3583', borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#4b5563', marginBottom: 10 },
  noteItem: { backgroundColor: 'white', borderRadius: 18, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  noteItemActive: { borderColor: '#1D3583', borderWidth: 1 },
  itemTitle: { fontWeight: 'bold', color: '#1f2937' },
  itemContent: { color: '#6b7280', fontSize: 12 },
  deleteBtn: { padding: 8 }
});

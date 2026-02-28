import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotesUnifiedScreen() {
  const context = useAppContext();
  const { appData, addNote, updateNote, deleteNote } = context as any;
  const notes = appData?.notes || [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    if (editingId) {
      await updateNote(editingId, { title, content, date: new Date().toISOString() });
    } else {
      await addNote({ id: `note-${Date.now()}`, title, content, date: new Date().toISOString() });
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const startEdit = (note: any) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  return (
    <View style={styles.container}>
      {/* SECTION 1 : L'ÉDITEUR (Toujours présent en haut) */}
      <View style={styles.editorCard}>
        <Text style={styles.sectionTitle}>{editingId ? "Modifier la note" : "Nouvelle note"}</Text>
        <TextInput 
          style={styles.inputTitle} 
          placeholder="Titre..." 
          value={title} 
          onChangeText={setTitle} 
        />
        <TextInput 
          style={styles.inputContent} 
          placeholder="Écrivez ici..." 
          multiline 
          value={content} 
          onChangeText={setContent} 
        />
        <View style={styles.row}>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.btnText}>Enregistrer</Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
              <Text style={styles.btnText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SECTION 2 : LA LISTE (En dessous) */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.noteItem} onPress={() => startEdit(item)}>
            <View style={{flex: 1}}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.noteSnippet}>{item.content}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteNote(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<Text style={styles.listHeader}>Mes Notes ({notes.length})</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB', padding: 16, paddingTop: 50 },
  editorCard: { backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 20, elevation: 4 },
  sectionTitle: { fontWeight: 'bold', color: '#1D3583', marginBottom: 10 },
  inputTitle: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8, fontWeight: 'bold', fontSize: 16 },
  inputContent: { minHeight: 60, paddingTop: 10 },
  row: { flexDirection: 'row', marginTop: 10, gap: 10 },
  saveBtn: { backgroundColor: '#1D3583', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#9ca3af', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  listHeader: { fontWeight: 'bold', fontSize: 18, color: '#4b5563', marginBottom: 10 },
  noteItem: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  noteTitle: { fontWeight: 'bold', color: '#1f2937' },
  noteSnippet: { color: '#6b7280', fontSize: 12 }
});

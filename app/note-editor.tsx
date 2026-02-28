import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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

  // Récupération sécurisée des notes
  const notes = useMemo(() => {
    const list = appData?.notes || [];
    return [...list].sort((a: any, b: any) => 
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
        // MISE À JOUR : On passe un nouvel objet complet
        await updateNote(editingId, { 
          title: title.trim(), 
          content: content.trim(), 
          date: new Date().toISOString() 
        });
        Alert.alert("Succès", "Note mise à jour");
      } else {
        // AJOUT
        await addNote({ 
          id: `note-${Date.now()}`, 
          title: title.trim(), 
          content: content.trim(), 
          date: new Date().toISOString() 
        });
      }
      resetForm();
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer la note.");
    }
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

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Supprimer la note",
      "Voulez-vous vraiment effacer cette note ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              if (editingId === id) resetForm(); // On vide le formulaire si on supprime la note en cours d'édition
              await deleteNote(id);
            } catch (err) {
              Alert.alert("Erreur", "La suppression a échoué.");
            }
          } 
        }
      ]
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MES NOTES</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Éditeur */}
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorMode}>{editingId ? "MODIFICATION" : "NOUVELLE NOTE"}</Text>
            {editingId && (
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Titre de la note..." 
            style={styles.inputTitle} 
            placeholderTextColor="#9ca3af"
          />
          <TextInput 
            value={content} 
            onChangeText={setContent} 
            placeholder="Écrire quelque chose..." 
            multiline 
            style={styles.inputContent} 
            textAlignVertical="top"
            placeholderTextColor="#d1d5db"
          />
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{editingId ? "METTRE À JOUR" : "ENREGISTRER LA NOTE"}</Text>
          </TouchableOpacity>
        </View>

        {/* Liste Historique */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Historique ({notes.length})</Text>
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.noteItem, editingId === item.id && styles.noteItemActive]} 
                onPress={() => startEdit(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title || "Note sans titre"}</Text>
                  <Text style={styles.itemContent} numberOfLines={1}>{item.content || "Pas de contenu"}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { paddingHorizontal: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '900', color: '#1D3583', fontSize: 18, letterSpacing: 1 },
  editorCard: { backgroundColor: 'white', margin: 16, borderRadius: 25, padding: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  editorMode: { fontSize: 11, fontWeight: 'bold', color: '#B21F18', letterSpacing: 1 },
  cancelText: { fontSize: 11, fontWeight: 'bold', color: '#6b7280' },
  inputTitle: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 10, color: '#1f2937' },
  inputContent: { fontSize: 15, minHeight: 100, maxHeight: 180, paddingTop: 15, color: '#4b5563' },
  saveBtn: { backgroundColor: '#1D3583', borderRadius: 50, paddingVertical: 16, alignItems: 'center', marginTop: 15 },
  saveBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  listTitle: { fontSize: 15, fontWeight: 'bold', color: '#6b7280', marginBottom: 12, marginLeft: 5 },
  noteItem: { backgroundColor: 'white', borderRadius: 20, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  noteItemActive: { borderColor: '#1D3583', borderWidth: 2 },
  itemTitle: { fontWeight: 'bold', color: '#1f2937', fontSize: 15, marginBottom: 4 },
  itemContent: { color: '#9ca3af', fontSize: 13 },
  deleteBtn: { padding: 10, marginLeft: 5 }
});

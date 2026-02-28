import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function NoteEditorScreen() {
  const router = useRouter();
  const context = useAppContext();
  const { appData, addNote, updateNote, deleteNote } = context as any;

  // États pour l'éditeur
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Récupération de la liste des notes
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
        // Mode Mise à jour
        await updateNote(editingId, {
          title: title.trim(),
          content: content.trim(),
          date: new Date().toISOString(),
        });
      } else {
        // Mode Création
        await addNote({
          id: `note-${Date.now()}`,
          title: title.trim(),
          content: content.trim(),
          date: new Date().toISOString(),
        });
      }
      resetForm();
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
    Alert.alert('Supprimer', 'Supprimer définitivement cette note ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', 
        style: 'destructive', 
        onPress: async () => {
          await deleteNote(id);
          if (editingId === id) resetForm();
        } 
      },
    ]);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        {/* SECTION 1 : L'ÉDITEUR */}
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorMode}>
              {editingId ? "MODIFICATION" : "NOUVELLE NOTE"}
            </Text>
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
            placeholderTextColor="#9ca3af"
            style={styles.inputTitle}
          />
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Commencez à écrire..."
            placeholderTextColor="#9ca3af"
            multiline
            style={styles.inputContent}
            textAlignVertical="top"
          />

          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>
              {editingId ? "METTRE À JOUR" : "ENREGISTRER LA NOTE"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 2 : LA LISTE */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Historique ({notes.length})</Text>
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.noteItem, editingId === item.id && styles.noteItemActive]} 
                onPress={() => startEdit(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title || "Note sans titre"}
                  </Text>
                  <Text style={styles.itemContent} numberOfLines={1}>
                    {item.content || "Aucun contenu..."}
                  </Text>
                  <Text style={styles.itemDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => confirmDelete(item.id)} 
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </FlatList>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '900', color: '#1D3583', fontSize: 18, letterSpacing: 1 },
  
  editorCard: { 
    backgroundColor: 'white', 
    margin: 16, 
    borderRadius: 25, 
    padding: 16, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  editorMode: { fontSize: 10, fontWeight: 'bold', color: '#B21F18', letterSpacing: 1 },
  cancelText: { fontSize: 10, fontWeight: 'bold', color: '#6b7280' },
  
  inputTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3583', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8, marginBottom: 10 },
  inputContent: { fontSize: 14, color: '#374151', minHeight: 80, maxHeight: 150 },
  
  saveBtn: { backgroundColor: '#1D3583', borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },

  listContainer: { flex: 1, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#4b5563', marginBottom: 12, marginLeft: 4 },
  
  noteItem: { 
    backgroundColor: 'white', 
    borderRadius: 18, 
    padding: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  noteItemActive: { borderColor: '#1D3583', backgroundColor: '#F0F4FF' },
  itemTitle: { fontWeight: 'bold', color: '#1f2937', fontSize: 15, marginBottom: 2 },
  itemContent: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  itemDate: { fontSize: 9, color: '#9ca3af', fontWeight: '600' },
  deleteBtn: { padding: 8, marginLeft: 10 },
});

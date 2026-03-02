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
  Platform, 
  Keyboard, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Trash2, StickyNote } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { appData, addNote, updateNote, deleteNote } = useAppContext() as any;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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
        await updateNote(editingId, { 
          title: title.trim(), 
          content: content.trim(), 
          date: new Date().toISOString() 
        });
        Alert.alert("Succès", "Note mise à jour");
      } else {
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
      Alert.alert("Erreur", "Impossible d'enregistrer.");
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
      "Supprimer",
      "Voulez-vous effacer cette note ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            if (editingId === id) resetForm();
            await deleteNote(id);
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* HEADER ROUGE PILL SHAPE */}
        <View style={styles.headerPadding}>
          <View style={[styles.redHeaderPill, styles.glow]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={[styles.headerTitleText, styles.boldSerif]}>Mes Notes</Text>
            <View style={{ width: 40 }} /> 
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          {/* ÉDITEUR DANS UNE CARTE BLANCHE */}
          <View style={[styles.editorCard, styles.glow]}>
            <View style={styles.editorHeader}>
              <Text style={[styles.editorMode, styles.boldSerif]}>
                {editingId ? "Modification" : "Nouvelle Note"}
              </Text>
              {editingId && (
                <TouchableOpacity onPress={resetForm}>
                  <Text style={[styles.cancelText, styles.boldSerif]}>Annuler</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TextInput 
              value={title} 
              onChangeText={setTitle} 
              placeholder="Titre..." 
              style={[styles.inputTitle, styles.boldSerif]} 
              placeholderTextColor="#94A3B8"
            />
            <TextInput 
              value={content} 
              onChangeText={setContent} 
              placeholder="Écrire ici..." 
              multiline 
              style={[styles.inputContent, styles.boldSerif]} 
              textAlignVertical="top"
              placeholderTextColor="#CBD5E1"
            />
            
            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, styles.glow]}>
              <Text style={[styles.saveBtnText, styles.boldSerif]}>
                {editingId ? "Mettre à jour" : "Enregistrer"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* LISTE HISTORIQUE */}
          <View style={styles.listContainer}>
            <View style={styles.historyHeader}>
                <StickyNote size={18} color="#1A237E" />
                <Text style={[styles.listTitle, styles.boldSerif]}>Historique ({notes.length})</Text>
            </View>
            
            <FlatList
              data={notes}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.noteItem, editingId === item.id && styles.noteItemActive]} 
                  onPress={() => startEdit(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, styles.boldSerif]} numberOfLines={1}>
                        {item.title || "Note sans titre"}
                    </Text>
                    <Text style={[styles.itemContent, styles.boldSerif]} numberOfLines={1}>
                        {item.content || "Pas de contenu"}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
                    <Trash2 size={20} color="#8B0000" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  
  // STYLE CENTRALISÉ : SERIF + GRAS MAXIMUM
  boldSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
  },

  headerPadding: { paddingHorizontal: 25, paddingTop: 30, marginBottom: 20 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontSize: 14, letterSpacing: 1 },

  // Éditeur
  editorCard: { 
    backgroundColor: 'white', 
    marginHorizontal: 25, 
    borderRadius: 35, 
    padding: 22, 
    borderWidth: 1, 
    borderColor: '#FCE7F3',
    marginBottom: 25
  },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  editorMode: { fontSize: 11, color: '#8B0000', letterSpacing: 1 },
  cancelText: { fontSize: 11, color: '#64748B', textDecorationLine: 'underline' },
  
  inputTitle: { 
    fontSize: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9', 
    paddingVertical: 10, 
    color: '#1A237E' 
  },
  inputContent: { 
    fontSize: 15, 
    minHeight: 80, 
    maxHeight: 150, 
    paddingTop: 15, 
    color: '#475569',
  },
  
  saveBtn: { 
    backgroundColor: '#1A237E', 
    borderRadius: 50, 
    paddingVertical: 18, 
    alignItems: 'center', 
    marginTop: 10,
  },
  saveBtnText: { color: 'white', letterSpacing: 1.5, fontSize: 12 },

  // Liste
  listContainer: { flex: 1, paddingHorizontal: 25 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, marginLeft: 10 },
  listTitle: { fontSize: 12, color: '#1A237E', letterSpacing: 1 },
  
  noteItem: { 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    borderRadius: 25, 
    padding: 20, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'white' 
  },
  noteItemActive: { 
    backgroundColor: 'white', 
    borderColor: '#1A237E', 
    borderWidth: 2,
    elevation: 3
  },
  itemTitle: { color: '#1A237E', fontSize: 14, marginBottom: 4 },
  itemContent: { color: '#64748B', fontSize: 12 },
  deleteBtn: { padding: 10, marginLeft: 5 },

  glow: { 
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, 
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 } 
  }
});

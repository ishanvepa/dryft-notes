import NoteGraph from '@/components/NoteGraph';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';


export default function HomeScreen() {
  const [notes, setNotes] = useState([
    { id: '1', label: 'First', content: 'First note', cluster: 'A' },
    { id: '2', label: 'Second', content: 'Second note', cluster: 'A' },
    { id: '3', label: 'Third', content: 'Third note', cluster: 'B' },
    { id: '4', label: 'Fourth', content: 'Fourth note', cluster: 'B' },
    { id: '5', label: 'Fifth', content: 'Fifth note', cluster: 'C' },
    { id: '6', label: 'Sixth', content: 'Sixth note', cluster: 'C' },
    { id: '7', label: 'Seventh', content: 'Seventh note', cluster: 'C' },
    { id: '8', label: 'Eighth', content: 'Eighth note', cluster: 'D' },

  ]);

  const [links, setLinks] = useState(() => {
    const clusterMap = {};
    notes.forEach(note => {
      if (!clusterMap[note.cluster]) clusterMap[note.cluster] = [];
      clusterMap[note.cluster].push(note.id);
    });

    const generatedLinks: { source: string; target: string }[] = [];
    Object.values(clusterMap).forEach(ids => {
      for (let i = 0; i < ids.length - 1; i++) {
        generatedLinks.push({ source: ids[i], target: ids[i + 1] });
      }
    });
    return generatedLinks;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <Pressable
        onPress={() => {
          const newId = (notes.length + 1).toString();
          const newNote = {
            id: newId,
            label: `Note ${newId}`,
            content: `Content for note ${newId}`,
            cluster: String.fromCharCode(65 + (notes.length % 4)), // Cycles A-D
          };
          setNotes([...notes, newNote]);
          setLinks(prevLinks => {
            // Optionally add a link to the previous note in the same cluster
            const sameClusterNotes = [...notes, newNote].filter(n => n.cluster === newNote.cluster);
            if (sameClusterNotes.length > 1) {
              return [
                ...prevLinks,
                { source: sameClusterNotes[sameClusterNotes.length - 2].id, target: newId },
              ];
            }
            return prevLinks;
          });
        }}
        accessibilityLabel="Add a new note"
        style={styles.notebutton}
      >
        <Text>Add Note</Text>
      </Pressable>

      <NoteGraph
        notes={notes}
        relationships={links}
        onUpdateNote={(newNotes) => setNotes(newNotes)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    marginBottom: 10,
  },
  notebutton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  }
});

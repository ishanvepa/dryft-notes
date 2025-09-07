import { useState } from 'react';
import { Button, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

// Lazy-load web editor to avoid bundling Lexical on native
let WebEditor = null;
try {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    WebEditor = require('./WebRichTextEditor').default;
  }
} catch (e) {
  // ignore - will fallback to text input
}

export default function NoteEditorModal({ note, onClose, onSave }) {
  const [text, setText] = useState(note.content || '');
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  if(isMobile){
      return (
        <Modal animationType="slide" transparent={true} visible={true}>
          <View style={styles.overlay}>
            <ScrollView style={styles.modal}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Edit your note"
                multiline
              />
              <Button title="Save" onPress={() => onSave(text)} />
              <Button title="Cancel" onPress={onClose} color="gray" />
            </ScrollView>
          </View>
        </Modal>
      );
  } else {
    // web: render lexical web editor in a modal-like container
    if (WebEditor) {
      return (
        <Modal animationType="slide" transparent={true} visible={true}>
          <View style={styles.overlay}>
            <View style={[styles.modal, { maxHeight: '80%' }]}>
              <WebEditor
                initialText={note.content || ''}
                onSave={(text) => {
                  onSave(text);
                }}
              />
              <Button title="Close" onPress={onClose} color="gray" />
            </View>
          </View>
        </Modal>
      );
    }
    // fallback to a simple web textarea if lexical isn't available
  }
    return (
      <Modal animationType="slide" transparent={true} visible={true}>
        <View style={styles.overlay}>
          <ScrollView style={styles.modal}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Edit your note"
              multiline
            />
            <Button title="Save" onPress={() => onSave(text)} />
            <Button title="Cancel" onPress={onClose} color="gray" />
          </ScrollView>
        </View>
      </Modal>
    );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    paddingTop: 50
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    textAlignVertical: 'top',
  },
});

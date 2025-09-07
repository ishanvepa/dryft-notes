/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Button, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function NoteEditorModal(props) {
  const { note, onClose, onSave } = props;
  const [text, setText] = useState(note?.content || '');
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  if(isMobile){
      return (
        <Modal animationType="fade" transparent={true} visible={true}>
          <View style={styles.overlay}>
            <ScrollView style={styles.modal}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{top:10,left:10,right:10,bottom:10}}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={setText}
                  placeholder="Edit your note"
                  multiline
                />
                <Button title="Save" onPress={() => onSave(text)} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      );
  } else {
    // web: render lexical web editor in a modal-like container
    const webAvailable = !!WebEditor;
    if (webAvailable) {
      return (
        <Modal animationType="fade" transparent={true} visible={true}>
          <View style={styles.overlay}>
            <View style={[styles.modal, { maxHeight: '80%' }]}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{top:10,left:10,right:10,bottom:10}}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <WebEditor
                  initialText={note?.content || ''}
                  onSave={(text) => {
                    onSave(text);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      );
    }
    // fallback to a simple web textarea if lexical isn't available
  }
    return (
      <Modal animationType="fade" transparent={true} visible={true}>
        <View style={styles.overlay}>
          <ScrollView style={styles.modal}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{top:10,left:10,right:10,bottom:10}}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Edit your note"
                multiline
              />
              <Button title="Save" onPress={() => onSave(text)} />
            </View>
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
  modalContent: {
    position: 'relative',
    minHeight: 200,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  zIndex: 9999,
  elevation: 9999,
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: 8,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  },
  closeText: {
  fontSize: 20,
  color: '#fff',
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

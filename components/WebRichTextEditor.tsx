import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import LexicalTheme from './LexicalTheme';

import './LexicalTheme.css';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import handleSave from './saveNote';

function InnerEditor({ initialText }: { initialText?: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialText === undefined || initialText === null) return;
    try {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(initialText));
        root.append(paragraph);
      });
    } catch (err) {
      console.warn('Failed to set initial text in editor:', err);
    }
  }, [initialText, editor]);

  return null;
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
        }
        // Log the editor state as JSON
        const json = editorState.toJSON();
        console.log('Editor state updated:', json);
      });
    });
  }, [editor]);

  // Track undo/redo stack using editor history state
  useEffect(() => {
    // Listen for editor updates to update undo/redo availability
    return editor.registerUpdateListener(() => {
      const historyState = (editor as any)._historyState;
      if (historyState) {
        setCanUndo(historyState.canUndo());
        setCanRedo(historyState.canRedo());
      } else {
        setCanUndo(false);
        setCanRedo(false);
      }
    });
  }, [editor]);

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      background: '#222',
      padding: '8px 12px',
      borderRadius: 6,
      alignItems: 'center'
    }}>
      <button
        type="button"
        aria-label="Bold"
        style={{
          fontWeight: isBold ? 'bold' : 'normal',
          background: isBold ? '#444' : 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: 'pointer'
        }}
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
      >
        B
      </button>
      <button
        type="button"
        aria-label="Italic"
        style={{
          fontStyle: isItalic ? 'italic' : 'normal',
          background: isItalic ? '#444' : 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: 'pointer'
        }}
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
      >
        I
      </button>
      <button
        type="button"
        aria-label="Underline"
        style={{
          textDecoration: isUnderline ? 'underline' : 'none',
          background: isUnderline ? '#444' : 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: 'pointer'
        }}
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
      >
        U
      </button>
      <button
        type="button"
        aria-label="Undo"
        style={{
          background: canUndo ? '#444' : 'transparent',
          color: canUndo ? 'white' : '#888',
          border: 'none',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: canUndo ? 'pointer' : 'not-allowed'
        }}
        disabled={!canUndo}
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      >
        Undo
      </button>
      <button
        type="button"
        aria-label="Redo"
        style={{
          background: canRedo ? '#444' : 'transparent',
          color: canRedo ? 'white' : '#888',
          border: 'none',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: canRedo ? 'pointer' : 'not-allowed'
        }}
        disabled={!canRedo}
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
      >
        Redo
      </button>
    </div>
  );
}

function SaveButton({ router, style, onSave }: { router: any; style?: React.CSSProperties; onSave?: (text?: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const onClick = async () => {
    let plainText: string | undefined;
    try {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        plainText = root.getTextContent();
      });
    } catch (e) {
      try {
        const s = editor.getEditorState();
        plainText = s.toJSON ? JSON.stringify(s.toJSON()) : undefined;
      } catch (err) {
        console.warn('Failed to read editor state for save:', err);
      }
    }

    if (onSave) {
      onSave(plainText);
      return;
    }

    // fallback: use shared handleSave which expects router and note
    handleSave(router, { text: plainText });
  };

  return (
    <button type="button" aria-label="Save" title="Save" style={style} onClick={onClick}>
      <Feather name="save" size={24} color="#fff" />
    </button>
  );
}

export default function WebRichTextEditor({ initialText, onSave }: { initialText?: string; onSave?: (text?: string) => void }) {
  const router = useRouter();

  // navigation + save handled by SaveButton which calls shared handleSave

  const initialConfig = {
    namespace: 'WebEditor',
    theme: LexicalTheme,
    onError(error: Error) {
      throw error;
    },
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#111',
      color: 'white',
      fontFamily: 'sans-serif',
      position: 'relative',
    },
    editorInput: {
      minHeight: 300,
      outline: 'none',
      color: 'white',
      fontSize: 16,
      lineHeight: 1.5,
    },
    placeholder: {
      color: '#888',
      position: 'absolute',
      top: 16,
      left: 16,
      pointerEvents: 'none',
      fontSize: 16,
    },
    fab: {
      position: 'fixed',
      right: 20,
      bottom: 90,
      backgroundColor: '#2e7d32',
      width: 56,
      height: 56,
      borderRadius: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontSize: 20,
    },
  };

  return (
    <div style={styles.container}>
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-placeholder={'Enter some text...'}
              placeholder={<div style={styles.placeholder}>Enter some text...</div>}
              style={styles.editorInput}
            />
          }
          placeholder={<div style={styles.placeholder}>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
  <SaveButton router={router} style={styles.fab} onSave={onSave} />
      </LexicalComposer>
    </div>
  );
}

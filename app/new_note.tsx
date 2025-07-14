import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';


const inputAccessoryViewID = "newNote";
const EXAMPLE_CONTENT = [
  "# Insert subtitle here!",
  "Hello, *world*! I'm excited to share this with you.",
  "Visit my website: codewithbeto.dev",
  "> This is a blockquote, a great way to highlight quotes or important notes.",
  "`inline code` is useful for highlighting code within a sentence.",
  "Here's a code block example:",
  "```\n// Codeblock\nconsole.log('🚀 Ready to launch!');\n```",
  "Mentions:",
  "- @here (notify everyone)",
  "- @beto@expo.dev (mention a specific user)",
  "Use #hashtags to organize content, like this: #mention-report",
].join("\n");
// const navigation = useNavigation();

export default function NewNote() {
  let Editor;
  if (Platform.OS === 'web') {
    Editor = require('@/components/WebRichTextEditor').default;
  } else {
    Editor = require('@/components/MobileRichTextEditor').default;
  }

  return (
    <View style={styles.container}>
      <Editor />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#111',
  },
});

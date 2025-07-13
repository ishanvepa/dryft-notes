import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";

const handleHead = ({ tintColor }) => <Text style={{ color: tintColor }}>H1</Text>;

const TempScreen = () => {
  const richText = useRef();
  const animatedBottom = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true);
      Animated.timing(animatedBottom, {
        toValue: e.endCoordinates.height,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(animatedBottom, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        setKeyboardVisible(false);
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    richText.current?.blurContentEditor();
  };

  const handleSave = () => {

    console.log("Note saved.");
    router.push("/(tabs)/index"); // or another route
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={{ paddingBottom: 300 }}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={dismissKeyboard}
            >
              <RichEditor
                ref={richText}
                placeholder="Start dryfting..."
                style={styles.editor}
                onChange={(descriptionText) => {
                  console.log("descriptionText:", descriptionText);
                }}
                editorStyle={{
                  backgroundColor: "#111",       // Editor background
                  color: "#fff",                 // Main text color
                  placeholderColor: "#888",      // Placeholder color
                }}
              />
            </ScrollView>
          </KeyboardAvoidingView>

          {keyboardVisible && (<Animated.View style={[styles.toolbarContainer, { bottom: Animated.subtract(animatedBottom, 27) }]}>
            <RichToolbar
              editor={richText}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.heading1,
              ]}
              iconMap={{ [actions.heading1]: handleHead }}
            />
          </Animated.View>)}
        </View>

      {/* Floating Save Button */}
      <TouchableOpacity style={styles.fab} onPress={handleSave}>
        <Feather name="save" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editor: {
    minHeight: 400,
    marginHorizontal: 5,
    // borderWidth: 1,
    // borderColor: "#ccc",
    backgroundColor: "#111"
  },
  toolbarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#f9f9f9",
    // borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // ✅ Elevation for Android
    elevation: 5,    
    borderColor: "#ccc",
    opacity: 1
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#2e7d32",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default TempScreen;

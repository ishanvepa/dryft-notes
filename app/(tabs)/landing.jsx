import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>have to jot a note? {"\n"} start dryfting</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Create Note" color="#fff" onPress={() => router.push('/new_note')} />
        </View>
        <View style={styles.button}>
          <Button title="View Notes" color="#fff" onPress={() => router.push('/(tabs)/profile')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    // marginHorizontal: 5,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: '#2e7d32',
    padding: 5
    
  },
});

import { signOut } from '@/lib/auth'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native'

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const doSignOut = async () => {
    setLoading(true)
    try {
      const ok = await signOut()
      if (ok) {
        // Replace nav so user cannot go back to protected screens
        router.replace('/signin' as any)
      } else {
        Alert.alert('Error', 'Sign out failed. Please try again.')
      }
    } catch (e) {
      console.warn('Sign out failed', e)
      Alert.alert('Error', 'Failed to sign out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
  console.log('Profile: handleSignOut pressed')
  Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => void doSignOut(),
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      <TouchableOpacity style={styles.button} onPress={handleSignOut} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign out</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: 'white', fontSize: 20, marginBottom: 24 },
  button: { backgroundColor: '#b91c1c', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
})

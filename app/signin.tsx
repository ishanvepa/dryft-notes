import { signIn } from '@/lib/auth';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 600;
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
  await signIn(email, password);
  router.push('/(tabs)/landing' as any);
    } catch (err: any) {
      setError(err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isWide && styles.containerWide]}>
      <View style={[styles.form, isWide && styles.formWide]}>
        <Text style={styles.title}>Sign in</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            accessibilityLabel="email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#bbb"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            accessibilityLabel="password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor="#bbb"
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.rowText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signup' as any)}>
            <Text style={styles.rowLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  containerWide: { alignItems: 'center' },
  form: { width: '100%' },
  formWide: { width: '100%', maxWidth: 420 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { marginBottom: 6, color: '#fff' },
  input: { borderWidth: 1, borderColor: '#333', padding: 10, borderRadius: 6, color: '#fff', width: '100%' },
  button: { marginTop: 12, backgroundColor: '#2e7d32', padding: 12, borderRadius: 6, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: 'red', marginTop: 8 },
  row: { marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rowText: { color: '#fff' },
  rowLink: { color: '#2e7d32', fontWeight: '600' },
});

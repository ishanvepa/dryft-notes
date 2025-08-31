import { signUp } from '@/lib/auth';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 600;
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [conflict, setConflict] = React.useState(false);

  const handleSubmit = async () => {
    setError(null);
    setConflict(false);
    setLoading(true);
    try {
      await signUp(email, password, fullName || undefined);
  // After sign-up, navigate to sign-in so the user can authenticate
  router.push('/signin' as any);
    } catch (err: any) {
      if (err?.status === 409 || err?.message === 'Account already exists') {
        setConflict(true);
        setError('An account already exists with this email.');
      } else {
        setError(err?.message || 'Sign up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isWide && styles.containerWide]}>
      <View style={[styles.form, isWide && styles.formWide]}>
        <Text style={styles.title}>Create account</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            accessibilityLabel="fullName"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>

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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
        </TouchableOpacity>

        {conflict ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: '#fff', marginBottom: 8 }}>If this is your account you can sign in instead.</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#2e7d32', paddingHorizontal: 20 }]} onPress={() => router.push('/signin' as any)}>
              <Text style={styles.buttonText}>Go to Sign in</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.rowText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signin' as any)}>
            <Text style={styles.rowLink}> Sign in</Text>
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

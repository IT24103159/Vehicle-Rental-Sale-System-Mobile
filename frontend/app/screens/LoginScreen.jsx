import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) {
      const targetScreen = result.user?.role === 'Admin' ? 'AdminHome' : 'CustomerHome';
      navigation.reset({ index: 0, routes: [{ name: targetScreen }] });
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>
            Samarasinghe <Text style={styles.goldText}>Motors</Text>
          </Text>
          <Text style={styles.brandSubtitle}>PREMIUM VEHICLE RENTALS & SALES</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Sign in to your account</Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>LOGIN</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>© 2026 Samarasinghe Motors</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0ebe0' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  goldText: { color: '#c9a052' },

  brandContainer: { alignItems: 'center', marginBottom: 40 },
  brandTitle: { fontSize: 32, fontWeight: 'bold', color: '#111318' },
  brandSubtitle: { fontSize: 11, color: '#5a5e6b', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
      default: { elevation: 10 }
    }),
  },
  header: { marginBottom: 30, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f1117' },
  headerSubtitle: { fontSize: 14, color: '#6c757d', marginTop: 4 },

  errorBox: {
    backgroundColor: '#fff3f3',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: '#d32f2f', fontSize: 14, textAlign: 'center' },

  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f1117',
  },
  submitBtn: {
    backgroundColor: '#161b27',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: '#1a1a1a' },
  footerLink: { fontSize: 14, color: '#c9a052', fontWeight: 'bold' },

  copyright: { textAlign: 'center', color: '#8f94a5', fontSize: 12, marginTop: 40 },
});

export default LoginScreen;

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nic: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseDetails: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const { fullName, email, nic, phone, password, confirmPassword, licenseDetails } = formData;

    if (!fullName || !email || !nic || !phone || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      fullName, email, nic, phone, password,
      licenseUrl: licenseDetails
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } else {
      setErrorMsg(result.message);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerArea}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Join Samarasinghe Motors today</Text>
        </View>

        <View style={styles.formCard}>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ {successMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput style={styles.input} placeholder="John Doe" value={formData.fullName} onChangeText={(v) => updateField('fullName', v)} />
              </View>
              <View style={[styles.inputWrap, { marginLeft: 15 }]}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput style={styles.input} placeholder="mail@example.com" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(v) => updateField('email', v)} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>NIC Number *</Text>
                <TextInput style={styles.input} placeholder="123456789V" value={formData.nic} onChangeText={(v) => updateField('nic', v)} />
              </View>
              <View style={[styles.inputWrap, { marginLeft: 15 }]}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput style={styles.input} placeholder="0771234567" keyboardType="phone-pad" value={formData.phone} onChangeText={(v) => updateField('phone', v)} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Password *</Text>
                <TextInput style={styles.input} placeholder="Create a strong password" secureTextEntry value={formData.password} onChangeText={(v) => updateField('password', v)} />
              </View>
              <View style={[styles.inputWrap, { marginLeft: 15 }]}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput style={styles.input} placeholder="Repeat your password" secureTextEntry value={formData.confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)} />
              </View>
            </View>

            <View style={styles.fullWidthGroup}>
              <Text style={styles.label}>Driving License Details (Optional but recommended)</Text>
              <TextInput style={styles.input} placeholder="Enter License Number or Reference" value={formData.licenseDetails} onChangeText={(v) => updateField('licenseDetails', v)} />
            </View>

            <TouchableOpacity
              style={[styles.signupBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupBtnText}>SIGN UP</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0ebe0' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 40 },
  headerArea: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0a1628' },
  subtitle: { fontSize: 15, color: '#6c757d', marginTop: 6 },

  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
      default: { elevation: 5 }
    }),
  },

  errorBox: { backgroundColor: '#fff3f3', borderWidth: 1, borderColor: '#ffcdd2', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: '#d32f2f', fontSize: 14, textAlign: 'center' },
  successBox: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9', borderRadius: 8, padding: 12, marginBottom: 16 },
  successText: { color: '#2e7d32', fontSize: 14, textAlign: 'center' },

  form: { width: '100%' },
  row: { flexDirection: 'row', marginBottom: 20 },
  inputWrap: { flex: 1 },
  fullWidthGroup: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0a1628',
  },
  signupBtn: {
    backgroundColor: '#111318',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.7 },
  signupBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { fontSize: 14, color: '#1a1a1a' },
  footerLink: { fontSize: 14, color: '#c9a052', fontWeight: 'bold' },
});

export default RegisterScreen;

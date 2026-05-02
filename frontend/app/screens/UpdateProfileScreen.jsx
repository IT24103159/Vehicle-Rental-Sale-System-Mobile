import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const UpdateProfileScreen = ({ navigation }) => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    nic: user?.nic || '',
    licenseUrl: user?.licenseUrl || '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleUpdate = async () => {
    setMsg({ type: '', text: '' });
    if (!formData.fullName || !formData.phone) {
      setMsg({ type: 'error', text: 'Full Name and Phone are required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.put('/users/profile', formData);
      const updatedUser = response.data;
      
      // Update local context and storage
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setUser(updatedUser);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerArea}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
              <Text style={{ color: '#c9a052', fontWeight: 'bold' }}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Profile Settings</Text>
            <Text style={styles.subtitle}>personal details • account security</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTxt}>👤 Personal Information</Text>
            </View>

            {msg.text ? (
              <View style={[styles.msgBox, msg.type === 'error' ? styles.errorBox : styles.successBox]}>
                <Text style={msg.type === 'error' ? styles.errorTxt : styles.successTxt}>
                  {msg.type === 'error' ? '⚠️' : '✅'} {msg.text}
                </Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.fullName}
                    onChangeText={(v) => setFormData({ ...formData, fullName: v })}
                    placeholder="Enter full name"
                  />
                </View>
                <View style={[styles.inputGroup, { marginLeft: 16 }]}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL (ACCOUNT ID)</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={formData.email}
                    editable={false}
                  />
                  <Text style={styles.infoHint}>Email cannot be changed.</Text>
                </View>
                <View style={[styles.inputGroup, { marginLeft: 16 }]}>
                  <Text style={styles.label}>NIC</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={formData.nic}
                    editable={false}
                  />
                  <Text style={styles.infoHint}>Contact Admin to update NIC.</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DRIVING LICENSE URL</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.licenseUrl}
                    onChangeText={(v) => setFormData({ ...formData, licenseUrl: v })}
                    placeholder="Link to your license image"
                  />
                </View>
                <View style={[styles.inputGroup, { marginLeft: 16 }]}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(v) => setFormData({ ...formData, password: v })}
                    placeholder="Leave blank to keep current"
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnTxt}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 30 },
  
  headerArea: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f1117' },
  subtitle: { fontSize: 13, color: '#6c757d', textTransform: 'lowercase', marginTop: 4 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
      default: { elevation: 4 }
    }),
  },
  cardHeader: { marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 15 },
  cardHeaderTxt: { fontSize: 16, fontWeight: 'bold', color: '#c9a052' },

  msgBox: { padding: 12, borderRadius: 8, marginBottom: 20 },
  errorBox: { backgroundColor: '#fff3f3', borderWidth: 1, borderColor: '#ffcdd2' },
  successBox: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9' },
  errorTxt: { color: '#d32f2f', fontSize: 13, textAlign: 'center' },
  successTxt: { color: '#2e7d32', fontSize: 13, textAlign: 'center' },

  form: { width: '100%' },
  row: { flexDirection: 'row', marginBottom: 20 },
  inputGroup: { flex: 1 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#111318', marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111318',
  },
  disabledInput: { backgroundColor: '#f8f9fa', color: '#6c757d', borderColor: '#eee' },
  infoHint: { fontSize: 11, color: '#007bff', marginTop: 6 },
  
  saveBtn: {
    backgroundColor: '#111318',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  saveBtnTxt: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});

export default UpdateProfileScreen;

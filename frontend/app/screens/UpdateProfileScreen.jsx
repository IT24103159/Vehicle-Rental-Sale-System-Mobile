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
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const UpdateProfileScreen = ({ navigation }) => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    nic: user?.nic || '',
    licenseUrl: user?.licenseUrl || '',
    profilePic: user?.profilePic || '',
    password: '',
  });
  const [profileImage, setProfileImage] = useState(user?.profilePic || null);
  const [isUploading, setIsUploading] = useState(false);
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
      let finalData = { ...formData };

      // Upload image only if a new one was picked
      if (profileImage && profileImage !== user?.profilePic && !profileImage.startsWith('http')) {
        setMsg({ type: 'info', text: 'Uploading image...' });
        const uploadedUrl = await performImageUpload(profileImage);
        if (uploadedUrl) {
          finalData.profilePic = uploadedUrl;
        } else {
          throw new Error('Image upload failed');
        }
      }

      const response = await api.put('/users/profile', finalData);
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
      setMsg({ type: 'error', text: error.message || 'Update failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const performImageUpload = async (uri) => {
    try {
      const data = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        data.append('image', blob, 'profile.jpg');
      } else {
        data.append('image', {
          uri: uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }
      
      const response = await api.post('/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrl || null;
    } catch (error) {
      console.error('Upload Error:', error.response?.data || error);
      return null;
    }
  };


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setProfileImage(selectedUri);
      setMsg({ type: 'success', text: 'Image selected. Click Save Changes to upload.' });
    }
  };

  const removeImage = () => {
    const performRemove = () => {
      setProfileImage(null);
      setFormData({ ...formData, profilePic: '' });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove your profile picture?')) {
        performRemove();
      }
    } else {
      Alert.alert(
        'Remove Profile Picture',
        'Are you sure you want to remove your profile picture?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: performRemove },
        ]
      );
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.title}>Account Settings</Text>
                <Text style={styles.subtitle}>personal details • account security</Text>
              </View>

            </View>
          </View>

          {/* Account Details Summary */}
          <View style={styles.summarySection}>

            <View style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTxt}>Your Information</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailValue}>{user?.fullName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{user?.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{user?.phone || 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>NIC Number</Text>
                <Text style={styles.detailValue}>{user?.nic || 'Not set'}</Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Account Status</Text>
                <View style={styles.statusActive}>
                  <Text style={styles.statusActiveTxt}>• ACTIVE</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTxt}>👤 Personal Information</Text>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.imageSection}>
              <View style={styles.imageWrapper}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImg} />
                ) : (
                  <View style={styles.placeholderImg}>
                    <Text style={styles.placeholderTxt}>{user?.fullName?.[0] || '?'}</Text>
                  </View>
                )}
                {isUploading && (
                  <View style={styles.loaderOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.imageBtns}>
                <TouchableOpacity style={styles.pickBtn} onPress={pickImage} disabled={isUploading}>
                  <Text style={styles.pickBtnTxt}>{profileImage ? 'Change Photo' : 'Upload Photo'}</Text>
                </TouchableOpacity>
                {profileImage && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={removeImage} disabled={isUploading}>
                    <Text style={styles.deleteBtnTxt}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {msg.text ? (
              <View style={[styles.msgBox, msg.type === 'error' ? styles.errorBox : msg.type === 'success' ? styles.successBox : styles.infoBox]}>
                <Text style={msg.type === 'error' ? styles.errorTxt : msg.type === 'success' ? styles.successTxt : styles.infoTxt}>
                  {msg.type === 'error' ? '⚠️' : msg.type === 'success' ? '✅' : 'ℹ️'} {msg.text}
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#0f1117' },
  subtitle: { fontSize: 13, color: '#6c757d', textTransform: 'lowercase', marginTop: 4 },

  summarySection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111318', marginBottom: 15 },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: { fontSize: 13, color: '#6c757d' },
  detailValue: { fontSize: 13, fontWeight: 'bold', color: '#111318', flex: 1, textAlign: 'right', marginLeft: 10 },
  statusActive: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActiveTxt: { fontSize: 11, fontWeight: 'bold', color: '#2e7d32' },

  logoutBtn: { backgroundColor: '#ffebee', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ffcdd2' },
  logoutBtnTxt: { color: '#d32f2f', fontWeight: 'bold', fontSize: 13 },

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
  cardHeaderTxt: { fontSize: 16, fontWeight: 'bold', color: '#000000' },

  msgBox: { padding: 12, borderRadius: 8, marginBottom: 20 },
  errorBox: { backgroundColor: '#fff3f3', borderWidth: 1, borderColor: '#ffcdd2' },
  successBox: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9' },
  infoBox: { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#bbdefb' },
  errorTxt: { color: '#d32f2f', fontSize: 13, textAlign: 'center' },
  successTxt: { color: '#2e7d32', fontSize: 13, textAlign: 'center' },
  infoTxt: { color: '#0277bd', fontSize: 13, textAlign: 'center' },

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

  imageSection: { alignItems: 'center', marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 25 },
  imageWrapper: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: 15, elevation: 3, position: 'relative' },
  profileImg: { width: '100%', height: '100%' },
  placeholderImg: { width: '100%', height: '100%', backgroundColor: '#c9a052', justifyContent: 'center', alignItems: 'center' },
  placeholderTxt: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  imageBtns: { flexDirection: 'row', gap: 10 },
  pickBtn: { backgroundColor: '#f0ebe0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dcd4c0' },
  pickBtnTxt: { fontSize: 13, color: '#111318', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ffcdd2' },
  deleteBtnTxt: { fontSize: 13, color: '#d32f2f', fontWeight: '600' },
});

export default UpdateProfileScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';
import { showAlert, showConfirm } from '../../services/alertHelper';

const AdminPromotionsScreen = ({ navigation }) => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Date Picker States
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setEditingId(null);
    setNewCode("");
    setNewDiscount("");
    setNewDesc("");
    setNewStart("");
    setNewEnd("");
    setImageUri(null);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setNewCode(p.code);
    setNewDiscount(p.discountPercent.toString());
    setNewDesc(p.description || "");
    setNewStart(new Date(p.startDate).toISOString().split('T')[0]);
    setNewEnd(new Date(p.endDate).toISOString().split('T')[0]);
    setImageUri(p.imageUrl || null);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/promotions');
      setPromos(res.data);
    } catch (err) {
      showAlert('Error', 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCode || !newDiscount || !newStart || !newEnd) {
      showAlert('Validation', "Please fill all required fields");
      return;
    }
    
    if (newStart < today) {
      showAlert('Error', "Start date cannot be in the past.");
      return;
    }
    
    if (newEnd < newStart) {
      showAlert('Error', "End date must be after the start date.");
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('code', newCode.toUpperCase());
      formData.append('discountPercent', newDiscount);
      formData.append('description', newDesc);
      formData.append('startDate', newStart);
      formData.append('endDate', newEnd);

      if (imageUri) {
        if (!imageUri.startsWith('http')) {
          if (Platform.OS === 'web') {
            const res = await fetch(imageUri);
            const blob = await res.blob();
            formData.append('image', blob, 'promo.jpg');
          } else {
            const filename = imageUri.split('/').pop() || 'promo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            formData.append('image', {
              uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
              name: filename,
              type
            });
          }
        } else {
          formData.append('existingImage', imageUri);
        }
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await api.put(`/promotions/${editingId}`, formData, config);
        showAlert('Success', "Promotion updated successfully!");
      } else {
        await api.post('/promotions', formData, config);
        showAlert('Success', "Promotion created and notification sent!");
      }
      
      resetForm();
      fetchPromos();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process promotion';
      showAlert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = async () => {
      try {
        await api.delete(`/promotions/${id}`);
        fetchPromos();
      } catch (err) {
        showAlert('Error', 'Failed to delete promotion');
      }
    };

    showConfirm("Confirm", "Delete this promotion?", confirmDelete);
  };

  const onDateChange = (event, selectedDate, type) => {
    if (type === 'start') {
      setShowStartPicker(Platform.OS === 'ios');
      if (selectedDate) {
        setNewStart(selectedDate.toISOString().split('T')[0]);
      }
    } else {
      setShowEndPicker(Platform.OS === 'ios');
      if (selectedDate) {
        setNewEnd(selectedDate.toISOString().split('T')[0]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Create Promotion Card */}
        <View style={styles.card}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
            <Text style={styles.cardTitle}>{editingId ? 'Edit Campaign' : 'Create New Campaign'}</Text>
            {editingId && (
              <TouchableOpacity onPress={resetForm} style={styles.cancelEditBtn}>
                <Text style={styles.cancelEditTxt}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PROMO CODE</Text>
            <TextInput style={styles.input} placeholder="e.g. SUMMER26" placeholderTextColor="#999" value={newCode} onChangeText={setNewCode} autoCapitalize="characters" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DISCOUNT PERCENTAGE (%)</Text>
            <TextInput style={styles.input} placeholder="e.g. 15" placeholderTextColor="#999" keyboardType="numeric" value={newDiscount} onChangeText={setNewDiscount} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DESCRIPTION</Text>
            <TextInput style={styles.input} placeholder="e.g. New Year Special Offer" placeholderTextColor="#999" value={newDesc} onChangeText={setNewDesc} />
          </View>
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>START DATE</Text>
              {Platform.OS === 'web' ? (
                <input type="date" min={today} style={webDateInputStyle} value={newStart} onChange={(e) => setNewStart(e.target.value)} />
              ) : (
                <>
                  <TouchableOpacity style={styles.dateSelector} onPress={() => setShowStartPicker(true)}>
                    <Text style={[styles.dateText, !newStart && {color: '#999'}]}>{newStart || 'Select Date'}</Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker
                      value={newStart ? new Date(newStart) : new Date()}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={(e, d) => onDateChange(e, d, 'start')}
                    />
                  )}
                </>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>END DATE</Text>
              {Platform.OS === 'web' ? (
                <input type="date" min={newStart || today} style={webDateInputStyle} value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
              ) : (
                <>
                  <TouchableOpacity style={styles.dateSelector} onPress={() => setShowEndPicker(true)}>
                    <Text style={[styles.dateText, !newEnd && {color: '#999'}]}>{newEnd || 'Select Date'}</Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker
                      value={newEnd ? new Date(newEnd) : new Date()}
                      mode="date"
                      display="default"
                      minimumDate={newStart ? new Date(newStart) : new Date()}
                      onChange={(e, d) => onDateChange(e, d, 'end')}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          <Text style={styles.inputLabel}>CAMPAIGN IMAGE (OPTIONAL)</Text>
          <View style={styles.imagePickerRow}>
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImageUri(null)}>
                  <Text style={styles.removeImgTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Text style={styles.addImageTxt}>+ Upload Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleAdd} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>{editingId ? 'Update Promotion' : 'Create Promotion'}</Text>}
          </TouchableOpacity>
        </View>

        {/* List of Promotions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Campaigns</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#c9a052" />
          ) : promos.length === 0 ? (
            <Text style={styles.emptyTxt}>No active promotions at the moment.</Text>
          ) : (
            promos.map(p => (
              <View key={p._id} style={styles.promoItem}>
                <View style={styles.promoHeader}>
                  {p.imageUrl ? (
                    <Image source={{ uri: p.imageUrl }} style={styles.promoListImg} />
                  ) : (
                    <View style={[styles.promoListImg, {backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center'}]}>
                      <Text style={{fontSize: 20}}>🏷️</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.promoCode}>{p.code}</Text>
                    <Text style={styles.promoDiscount}>{p.discountPercent}% OFF</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEdit(p)} style={styles.editBtn}>
                      <Text style={styles.editTxt}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(p._id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteTxt}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.promoDetails}>
                  <Text style={styles.promoDesc}>{p.description || "No description provided."}</Text>
                  <View style={styles.dateBadge}>
                    <Text style={styles.promoDates}>Valid: {new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const webDateInputStyle = {
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  backgroundColor: '#f9f9f9',
  color: '#333',
  fontSize: '14px',
  width: '100%',
  outline: 'none'
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: '#ffffff', 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtnTxt: { color: '#c9a052', fontWeight: '600', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },
  
  scrollContent: { padding: 15 },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  cardTitle: { color: '#1a1c24', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cancelEditBtn: { padding: 5 },
  cancelEditTxt: { color: '#ff4444', fontWeight: '600' },
  
  inputGroup: { marginBottom: 15 },
  inputLabel: { color: '#7f8c8d', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  input: { 
    backgroundColor: '#f9f9f9', 
    color: '#333', 
    padding: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#eee',
    fontSize: 14
  },
  
  dateSelector: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: { color: '#333', fontSize: 14 },
  calendarIcon: { fontSize: 16 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  
  btn: { backgroundColor: '#c9a052', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnTxt: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

  emptyTxt: { color: '#95a5a6', textAlign: 'center', marginTop: 20, fontSize: 14 },
  
  promoItem: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0', 
    paddingVertical: 20
  },
  promoHeader: { flexDirection: 'row', alignItems: 'center' },
  promoListImg: { width: 50, height: 50, borderRadius: 12, marginRight: 15 },
  promoCode: { color: '#1a1c24', fontSize: 16, fontWeight: 'bold' },
  promoDiscount: { color: '#c9a052', fontSize: 14, fontWeight: 'bold' },
  
  actionButtons: { flexDirection: 'row' },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 8, marginRight: 8 },
  editTxt: { color: '#555', fontSize: 12, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff0f0', borderRadius: 8 },
  deleteTxt: { color: '#ff4444', fontWeight: '600', fontSize: 12 },
  
  promoDetails: { marginTop: 12 },
  promoDesc: { color: '#7f8c8d', fontSize: 13, lineHeight: 18 },
  dateBadge: { 
    backgroundColor: '#f5f7fa', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6, 
    marginTop: 8 
  },
  promoDates: { color: '#95a5a6', fontSize: 11, fontWeight: '500' },
  
  imagePickerRow: { flexDirection: 'row', marginBottom: 20, marginTop: 5 },
  previewContainer: { position: 'relative', width: '100%', height: 150 },
  previewImg: { width: '100%', height: '100%', borderRadius: 15 },
  removeImgBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3 },
  removeImgTxt: { color: '#ff4444', fontSize: 14, fontWeight: 'bold' },
  addImageBtn: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderStyle: 'dashed', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
    height: 100 
  },
  addImageTxt: { color: '#c9a052', fontWeight: '600' },
});

export default AdminPromotionsScreen;

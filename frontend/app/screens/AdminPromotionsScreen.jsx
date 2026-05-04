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
import api from '../../services/api';

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
      if (Platform.OS === 'web') window.alert('Failed to fetch promotions');
      else Alert.alert('Error', 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCode || !newDiscount || !newStart || !newEnd) {
      if (Platform.OS === 'web') window.alert("Please fill all required fields");
      else Alert.alert('Validation', "Please fill all required fields");
      return;
    }
    
    if (newStart < today) {
      if (Platform.OS === 'web') window.alert("Start date cannot be in the past.");
      else Alert.alert('Error', "Start date cannot be in the past.");
      return;
    }
    
    if (newEnd < newStart) {
      if (Platform.OS === 'web') window.alert("End date must be after the start date.");
      else Alert.alert('Error', "End date must be after the start date.");
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
        if (Platform.OS === 'web') window.alert("Promotion updated successfully!");
        else Alert.alert('Success', "Promotion updated successfully!");
      } else {
        await api.post('/promotions', formData, config);
        if (Platform.OS === 'web') window.alert("Promotion created and notification sent!");
        else Alert.alert('Success', "Promotion created and notification sent!");
      }
      
      resetForm();
      fetchPromos();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process promotion';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
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
        if (Platform.OS === 'web') window.alert('Failed to delete promotion');
        else Alert.alert('Error', 'Failed to delete promotion');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Delete this promotion?")) confirmDelete();
    } else {
      Alert.alert("Confirm", "Delete this promotion?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Promotions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Create Promotion Card */}
        <View style={styles.card}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
            <Text style={styles.cardTitle}>{editingId ? '✏️ Edit Campaign' : '➕ Create New Campaign'}</Text>
            {editingId && (
              <TouchableOpacity onPress={resetForm}><Text style={{color: '#8a94a8'}}>Cancel Edit</Text></TouchableOpacity>
            )}
          </View>
          
          <TextInput style={styles.input} placeholder="Promo Code (e.g. SUMMER26)" value={newCode} onChangeText={setNewCode} />
          <TextInput style={styles.input} placeholder="Discount % (e.g. 15)" keyboardType="numeric" value={newDiscount} onChangeText={setNewDiscount} />
          <TextInput style={styles.input} placeholder="Description (e.g. New Year Special)" value={newDesc} onChangeText={setNewDesc} />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Start Date</Text>
              {Platform.OS === 'web' ? (
                <input type="date" min={today} style={styles.webDateInput} value={newStart} onChange={(e) => setNewStart(e.target.value)} />
              ) : (
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={newStart} onChangeText={setNewStart} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Date</Text>
              {Platform.OS === 'web' ? (
                <input type="date" min={newStart || today} style={styles.webDateInput} value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
              ) : (
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={newEnd} onChangeText={setNewEnd} />
              )}
            </View>
          </View>

          <Text style={styles.label}>Promotional Image Post (Optional)</Text>
          <View style={styles.imagePickerRow}>
            {imageUri && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImageUri(null)}>
                  <Text style={styles.removeImgTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {!imageUri && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Text style={styles.addImageTxt}>+ Add Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleAdd} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#070504" /> : <Text style={styles.btnTxt}>{editingId ? 'Update Offer' : 'Generate Offer'}</Text>}
          </TouchableOpacity>
        </View>

        {/* List of Promotions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏷️ Active Campaigns</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#c9a052" />
          ) : promos.length === 0 ? (
            <Text style={styles.emptyTxt}>No promotions found.</Text>
          ) : (
            promos.map(p => (
              <View key={p._id} style={styles.promoItem}>
                {p.imageUrl && (
                  <Image source={{ uri: p.imageUrl }} style={styles.promoListImg} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoCode}>{p.code}</Text>
                  <Text style={styles.promoDesc}>{p.description}</Text>
                  <Text style={styles.promoDates}>From: {new Date(p.startDate).toLocaleDateString()}  |  Until: {new Date(p.endDate).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text style={styles.promoDiscount}>{p.discountPercent}% OFF</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity onPress={() => handleEdit(p)} style={styles.editBtn}>
                      <Text style={styles.editTxt}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(p._id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteTxt}>Delete</Text>
                    </TouchableOpacity>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  header: { padding: 20, backgroundColor: '#f0ebe0', flexDirection: 'row', alignItems: 'center' },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },
  
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#111318', borderRadius: 16, padding: 20, marginBottom: 20 },
  cardTitle: { color: '#c9a052', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  
  input: { backgroundColor: '#1e212a', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#2b2f3a' },
  webDateInput: { padding: '15px', borderRadius: '10px', border: '1px solid #2b2f3a', backgroundColor: '#1e212a', color: '#fff', fontSize: '14px', width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { color: '#8a94a8', fontSize: 12, marginBottom: 5 },
  
  btn: { backgroundColor: '#c9a052', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: '#070504', fontWeight: 'bold', fontSize: 16 },

  emptyTxt: { color: '#8a94a8', textAlign: 'center', marginTop: 10 },
  
  promoItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#2b2f3a', paddingVertical: 15, alignItems: 'center' },
  promoListImg: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  promoCode: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  promoDesc: { color: '#8a94a8', fontSize: 12, marginVertical: 4 },
  promoDates: { color: '#c9a052', fontSize: 11 },
  promoDiscount: { color: '#c9a052', fontSize: 18, fontWeight: '900' },
  editBtn: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#2b2f3a', borderRadius: 5 },
  editTxt: { color: '#fff', fontSize: 11 },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 5 },
  deleteTxt: { color: '#EF4444', fontWeight: 'bold', fontSize: 11 },
  
  // Image UI
  imagePickerRow: { flexDirection: 'row', marginBottom: 15, marginTop: 5 },
  previewContainer: { position: 'relative', width: 100, height: 100 },
  previewImg: { width: '100%', height: '100%', borderRadius: 10 },
  removeImgBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeImgTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  addImageBtn: { backgroundColor: '#1e212a', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#2b2f3a', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', width: '100%', height: 80 },
  addImageTxt: { color: '#8a94a8', fontWeight: 'bold' },
});

export default AdminPromotionsScreen;

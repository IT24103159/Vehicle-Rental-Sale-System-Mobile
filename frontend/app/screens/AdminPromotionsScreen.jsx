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
} from 'react-native';
import api from '../../services/api';

const AdminPromotionsScreen = ({ navigation }) => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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
      await api.post('/promotions', {
        code: newCode.toUpperCase(),
        discountPercent: parseFloat(newDiscount),
        description: newDesc,
        startDate: newStart,
        endDate: newEnd
      });

      if (Platform.OS === 'web') window.alert("Promotion created and notification sent!");
      else Alert.alert('Success', "Promotion created and notification sent!");
      
      setNewCode(""); setNewDiscount(""); setNewDesc(""); setNewStart(""); setNewEnd("");
      fetchPromos();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create promotion';
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
          <Text style={styles.cardTitle}>➕ Create New Coupon</Text>
          
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

          <TouchableOpacity style={styles.btn} onPress={handleAdd} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#070504" /> : <Text style={styles.btnTxt}>Generate Offer</Text>}
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoCode}>{p.code}</Text>
                  <Text style={styles.promoDesc}>{p.description}</Text>
                  <Text style={styles.promoDates}>From: {new Date(p.startDate).toLocaleDateString()}  |  Until: {new Date(p.endDate).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.promoDiscount}>{p.discountPercent}% OFF</Text>
                  <TouchableOpacity onPress={() => handleDelete(p._id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteTxt}>Delete</Text>
                  </TouchableOpacity>
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
  
  promoItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#2b2f3a', paddingVertical: 15 },
  promoCode: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  promoDesc: { color: '#8a94a8', fontSize: 12, marginVertical: 4 },
  promoDates: { color: '#c9a052', fontSize: 11 },
  promoDiscount: { color: '#c9a052', fontSize: 18, fontWeight: '900' },
  deleteBtn: { marginTop: 10, padding: 5 },
  deleteTxt: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 }
});

export default AdminPromotionsScreen;

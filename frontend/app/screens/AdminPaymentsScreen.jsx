import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const AdminPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for viewing slip
  const [selectedSlip, setSelectedSlip] = useState(null);
  
  // Processing State
  const [processingId, setProcessingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setProcessingId(id);
    try {
      const remarks = newStatus === 'Rejected' ? 'Insufficient Amount / Invalid Slip' : 'Payment verified';
      await api.put(`/payments/${id}`, { status: newStatus, remarks });
      
      if (Platform.OS === 'web') {
        window.alert(`Success: Payment has been ${newStatus.toLowerCase()}.`);
      } else {
        Alert.alert('Success', `Payment has been ${newStatus.toLowerCase()}.`);
      }
      fetchPayments(); // Refresh list
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update status';
      if (Platform.OS === 'web') {
        window.alert('Error: ' + errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAction = (id, newStatus) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) {
        handleStatusUpdate(id, newStatus);
      }
    } else {
      Alert.alert(
        `${newStatus} Payment`,
        `Are you sure you want to mark this payment as ${newStatus}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Proceed', onPress: () => handleStatusUpdate(id, newStatus) }
        ]
      );
    }
  };

  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Assuming backend runs on localhost:5000. Adjust if needed.
    return `http://localhost:5000${url}`;
  };

  const handleViewSlip = (url) => {
    const fullUrl = getFileUrl(url);
    if (!fullUrl) return;

    if (fullUrl.toLowerCase().endsWith('.pdf')) {
      if (Platform.OS === 'web') {
        window.open(fullUrl, '_blank');
      } else {
        Alert.alert('PDF', 'PDF viewing requires a specific module on mobile. Please check via web dashboard.');
      }
    } else {
      setSelectedSlip(fullUrl);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Payments</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#c9a052" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>💳</Text>
              <Text style={styles.emptyTxt}>No payment records found.</Text>
            </View>
          ) : (
            payments.map((p) => (
              <View key={p._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.customerName}>👤 {p.bookingId?.customerId?.fullName || 'Unknown'}</Text>
                    <Text style={styles.bookingId}>Booking #{p.bookingId?._id?.substring(p.bookingId._id.length - 6).toUpperCase()}</Text>
                  </View>
                  <View style={[
                    styles.statusPill, 
                    p.status === 'Pending' ? styles.statusOrange : 
                    p.status === 'Approved' ? styles.statusGreen : styles.statusRed
                  ]}>
                    <Text style={[
                      styles.statusTxt,
                      p.status === 'Pending' ? styles.statusOrangeTxt : 
                      p.status === 'Approved' ? styles.statusGreenTxt : styles.statusRedTxt
                    ]}>{p.status}</Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.vehicleName}>🚙 {p.bookingId?.vehicleRentId?.name}</Text>
                  <Text style={styles.dateTxt}>Paid On: {new Date(p.paymentDate).toLocaleDateString()}</Text>
                  <Text style={styles.amountTxt}>Amount: Rs. {p.amount?.toLocaleString()}</Text>
                  
                  <TouchableOpacity 
                    style={styles.viewSlipBtn}
                    onPress={() => handleViewSlip(p.bankSlipUrl)}
                  >
                    <Text style={styles.viewSlipTxt}>👁️ View Bank Slip</Text>
                  </TouchableOpacity>
                </View>

                {p.status === 'Pending' && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => confirmAction(p._id, 'Approved')}
                      disabled={processingId === p._id}
                    >
                      {processingId === p._id ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.approveTxt}>✓ Approve</Text>}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => confirmAction(p._id, 'Rejected')}
                      disabled={processingId === p._id}
                    >
                      <Text style={styles.rejectTxt}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Slip Image Viewer Modal */}
      <Modal visible={!!selectedSlip} transparent={true} animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedSlip(null)}>
            <Text style={styles.closeModalTxt}>✕ Close</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedSlip }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#f0ebe0', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },

  scrollContent: { padding: 15 },
  
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  customerName: { fontSize: 14, fontWeight: 'bold', color: '#111318' },
  bookingId: { fontSize: 11, color: '#888', marginTop: 2 },
  
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: 'bold' },
  statusOrange: { backgroundColor: '#fff3e0', borderColor: '#ffe0b2' },
  statusOrangeTxt: { color: '#e65100' },
  statusGreen: { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' },
  statusGreenTxt: { color: '#2e7d32' },
  statusRed: { backgroundColor: '#ffebee', borderColor: '#ffcdd2' },
  statusRedTxt: { color: '#c62828' },

  cardBody: { marginBottom: 15 },
  vehicleName: { fontSize: 13, color: '#555', marginBottom: 4 },
  dateTxt: { fontSize: 12, color: '#666', marginBottom: 4 },
  amountTxt: { fontSize: 15, fontWeight: 'bold', color: '#c9a052', marginTop: 5 },

  viewSlipBtn: { alignSelf: 'flex-start', backgroundColor: '#f8f9fa', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', marginTop: 10 },
  viewSlipTxt: { fontSize: 12, color: '#111318', fontWeight: 'bold' },

  actionsRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  approveBtn: { backgroundColor: '#111318' },
  approveTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  rejectBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ef4444' },
  rejectTxt: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyTxt: { color: '#888', fontSize: 14 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeModal: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  closeModalTxt: { color: '#fff', fontWeight: 'bold' },
  fullImage: { width: '90%', height: '70%' },
});

export default AdminPaymentsScreen;

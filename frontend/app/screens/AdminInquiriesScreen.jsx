import React, { useState, useEffect } from 'react';
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
  Modal,
  TextInput,
  Platform
} from 'react-native';
import api from '../../services/api';
import CustomHeader from '../components/CustomHeader';

const AdminInquiriesScreen = ({ navigation }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reply Modal State
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('REPLIED');
  const [submitting, setSubmitting] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inquiries/admin/all');
      setInquiries(response.data);
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') window.alert("Failed to load inquiries");
      else Alert.alert('Error', 'Failed to load inquiries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenReply = (inq) => {
    setSelectedInquiry(inq);
    setReplyMessage(inq.adminReply || '');
    setReplyStatus(inq.status === 'PENDING' ? 'REPLIED' : inq.status);
    setShowReplyModal(true);
  };

  const submitReply = async () => {
    if (!replyMessage.trim()) {
      if (Platform.OS === 'web') window.alert("Please enter a reply message");
      else Alert.alert("Error", "Please enter a reply message");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/inquiries/admin/status/${selectedInquiry._id}`, {
        status: replyStatus,
        adminReply: replyMessage.trim()
      });
      
      setShowReplyModal(false);
      fetchInquiries();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to update inquiry';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeSale = (inq) => {
    if (Platform.OS === 'web') {
      if (!window.confirm("Finalize this sale? This will mark the vehicle as sold and reject all other inquiries for this vehicle.")) return;
      executeFinalizeSale(inq);
    } else {
      Alert.alert(
        "Finalize Sale",
        "Are you sure? This will mark the vehicle as sold and reject all other inquiries for it.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Finalize", style: "destructive", onPress: () => executeFinalizeSale(inq) }
        ]
      );
    }
  };

  const executeFinalizeSale = async (inq) => {
    try {
      setSubmitting(true);
      await api.post('/inquiries/admin/finalize-sale', {
        vehicleId: inq.vehicleSaleId._id,
        inquiryId: inq._id
      });
      
      if (Platform.OS === 'web') window.alert("Sale Finalized Successfully!");
      else Alert.alert("Success", "Sale Finalized Successfully!");
      
      fetchInquiries();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to finalize sale';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInquiry = (id) => {
    if (Platform.OS === 'web') {
      if (!window.confirm("Are you sure you want to delete this inquiry? This action cannot be undone.")) return;
      executeDelete(id);
    } else {
      Alert.alert(
        "Delete Inquiry",
        "Are you sure? This action will permanently remove the inquiry from the database.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => executeDelete(id) }
        ]
      );
    }
  };

  const executeDelete = async (id) => {
    try {
      setSubmitting(true);
      await api.delete(`/inquiries/admin/${id}`);
      if (Platform.OS === 'web') window.alert("Inquiry deleted successfully");
      else Alert.alert("Success", "Inquiry deleted successfully");
      fetchInquiries();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to delete inquiry';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInquiryCard = (inq) => {
    const isBuyNow = inq.inquiryType === 'BUY_NOW';
    return (
      <View key={inq._id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, isBuyNow ? styles.badgeBuy : styles.badgeNeg]}>
            <Text style={[styles.badgeTxt, isBuyNow ? styles.badgeTxtBuy : styles.badgeTxtNeg]}>
              {inq.inquiryType}
            </Text>
          </View>
          <Text style={[styles.statusTxt, 
            inq.status === 'ACCEPTED' ? {color: '#2e7d32'} : 
            inq.status === 'REJECTED' ? {color: '#d32f2f'} : {color: '#f57c00'}
          ]}>
            {inq.status}
          </Text>
        </View>

        <Text style={styles.vehicleName}>
          {inq.vehicleSaleId?.brand} {inq.vehicleSaleId?.name} 
          <Text style={styles.vehiclePrice}> (Rs. {(inq.vehicleSaleId?.price/1000000).toFixed(1)}M)</Text>
        </Text>
        <Text style={styles.vehicleStatus}>Vehicle Status: {inq.vehicleSaleId?.status}</Text>

        <View style={styles.customerBox}>
          <Text style={styles.custName}>👤 {inq.customerId?.fullName}</Text>
          <Text style={styles.custContact}>📞 {inq.customerId?.phone} | ✉️ {inq.customerId?.email}</Text>
        </View>

        <View style={styles.msgBox}>
          <Text style={styles.msgLabel}>Customer Message:</Text>
          <Text style={styles.msgText}>{inq.message}</Text>
        </View>

        {inq.adminReply ? (
          <View style={styles.replyBox}>
            <Text style={styles.msgLabel}>Your Reply:</Text>
            <Text style={styles.msgText}>{inq.adminReply}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.replyBtn} 
            onPress={() => handleOpenReply(inq)}
            disabled={submitting}
          >
            <Text style={styles.btnTxt}>Reply</Text>
          </TouchableOpacity>
          
          {isBuyNow && inq.status !== 'ACCEPTED' && inq.vehicleSaleId?.status === 'Available' && (
            <TouchableOpacity 
              style={styles.finalizeBtn} 
              onPress={() => handleFinalizeSale(inq)}
              disabled={submitting}
            >
              <Text style={styles.finalizeTxt}>✅ Finalize Sale</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => handleDeleteInquiry(inq._id)}
            disabled={submitting}
          >
            <Text style={styles.deleteBtnTxt}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <CustomHeader title="Inquiries & Sales" showBack={true} />

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageDesc}>Review negotiations and finalize vehicle sales.</Text>
        
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#c9a052" style={{marginTop: 50}} />
        ) : inquiries.length === 0 ? (
          <Text style={styles.emptyTxt}>No inquiries found.</Text>
        ) : (
          inquiries.map(renderInquiryCard)
        )}
        <View style={{height: 30}} />
      </ScrollView>

      {/* Reply Modal */}
      <Modal visible={showReplyModal} transparent={true} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to Inquiry</Text>
            
            <Text style={styles.label}>Select Status:</Text>
            <View style={styles.statusRow}>
              {['REPLIED', 'ACCEPTED', 'REJECTED'].map(st => (
                <TouchableOpacity 
                  key={st}
                  style={[styles.statusChip, replyStatus === st && styles.statusChipActive]}
                  onPress={() => setReplyStatus(st)}
                >
                  <Text style={[styles.statusChipTxt, replyStatus === st && styles.statusChipTxtActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Your Reply Message:</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your response to the customer..."
              multiline
              numberOfLines={4}
              value={replyMessage}
              onChangeText={setReplyMessage}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReplyModal(false)}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitReply} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.submitBtnTxt}>Send Reply</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  content: { padding: 15 },
  pageDesc: { color: '#666', marginBottom: 20, fontSize: 14 },
  emptyTxt: { textAlign: 'center', color: '#888', marginTop: 50, fontSize: 16 },

  card: { backgroundColor: '#fff', borderRadius: 15, padding: 18, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeBuy: { backgroundColor: '#e8f5e9' },
  badgeNeg: { backgroundColor: '#e3f2fd' },
  badgeTxtBuy: { color: '#2e7d32', fontWeight: 'bold', fontSize: 11 },
  badgeTxtNeg: { color: '#1565c0', fontWeight: 'bold', fontSize: 11 },
  statusTxt: { fontSize: 12, fontWeight: 'bold' },

  vehicleName: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  vehiclePrice: { color: '#c9a052' },
  vehicleStatus: { fontSize: 12, color: '#888', marginBottom: 12 },

  customerBox: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 12 },
  custName: { fontWeight: 'bold', color: '#333', fontSize: 13, marginBottom: 4 },
  custContact: { color: '#666', fontSize: 12 },

  msgBox: { marginBottom: 12 },
  replyBox: { marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#c9a052', paddingLeft: 10 },
  msgLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  msgText: { fontSize: 14, color: '#333', lineHeight: 20 },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  replyBtn: { flex: 1, backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnTxt: { color: '#334155', fontWeight: 'bold', fontSize: 13 },
  finalizeBtn: { flex: 1.5, backgroundColor: '#c9a052', padding: 12, borderRadius: 8, alignItems: 'center' },
  finalizeTxt: { color: '#111', fontWeight: 'bold', fontSize: 13 },
  deleteBtn: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, alignItems: 'center', width: 45 },
  deleteBtnTxt: { fontSize: 14 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#111' },
  label: { fontSize: 13, color: '#666', marginBottom: 8, marginTop: 10 },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  statusChipActive: { backgroundColor: '#111', borderColor: '#111' },
  statusChipTxt: { fontSize: 12, color: '#666' },
  statusChipTxtActive: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#f0f0f0' },
  cancelBtnTxt: { color: '#333', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#c9a052' },
  submitBtnTxt: { color: '#111', fontWeight: 'bold' },
});

export default AdminInquiriesScreen;

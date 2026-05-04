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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const PaymentHistoryScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/my-payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Fetch history error:', error);
      Alert.alert('Error', 'Failed to load your payment history.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#2e7d32'; // Green
      case 'Pending': return '#f57c00'; // Orange
      case 'Rejected': return '#d32f2f'; // Red
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Payment History</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#c9a052" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🧾</Text>
              <Text style={styles.emptyTxt}>No payment records found.</Text>
            </View>
          ) : (
            payments.map((p) => (
              <View key={p._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bookingId}>Booking #{p.bookingId?._id?.substring(p.bookingId._id.length - 6).toUpperCase()}</Text>
                  <View style={[styles.statusPill, { backgroundColor: getStatusColor(p.status) + '20', borderColor: getStatusColor(p.status) }]}>
                    <Text style={[styles.statusTxt, { color: getStatusColor(p.status) }]}>{p.status}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.vehicleName}>🚙 {p.bookingId?.vehicleRentId?.name || 'Vehicle Rental'}</Text>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateTxt}>📅 Paid On: {new Date(p.paymentDate).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.priceTxt}>Amount Paid: Rs. {p.amount?.toLocaleString()}</Text>

                  {p.remarks ? (
                    <View style={styles.remarksBox}>
                      <Text style={styles.remarksLabel}>Admin Remarks:</Text>
                      <Text style={styles.remarksTxt}>{p.remarks}</Text>
                    </View>
                  ) : null}
                </View>

                {p.status === 'Rejected' && (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => navigation.navigate('Payment', {
                      bookingId: p.bookingId?._id,
                      totalCost: p.amount,
                      vehicleName: p.bookingId?.vehicleRentId?.name
                    })}
                  >
                    <Text style={styles.payBtnTxt}>Re-upload Correct Slip</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#f0ebe0', flexDirection: 'row', alignItems: 'center' },
  backBtnTxt: { color: '#000000', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },

  scrollContent: { padding: 20 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  bookingId: { fontSize: 12, fontWeight: 'bold', color: '#888' },

  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: 'bold' },

  cardBody: { marginBottom: 10 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: '#111318', marginBottom: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateTxt: { fontSize: 12, color: '#666' },
  priceTxt: { fontSize: 14, fontWeight: 'bold', color: '#c9a052', marginTop: 5 },

  payBtn: { backgroundColor: '#111318', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  payBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyTxt: { color: '#888', fontSize: 14 },

  remarksBox: { marginTop: 10, padding: 10, backgroundColor: '#fff5f5', borderRadius: 8, borderWidth: 1, borderColor: '#fed7d7' },
  remarksLabel: { fontSize: 11, fontWeight: 'bold', color: '#c53030', marginBottom: 2 },
  remarksTxt: { fontSize: 12, color: '#742a2a', fontStyle: 'italic' },
});

export default PaymentHistoryScreen;

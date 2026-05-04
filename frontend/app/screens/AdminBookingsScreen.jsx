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
  Platform,
} from 'react-native';
import api from '../../services/api';

const AdminBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/admin/all');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/admin/status/${id}`, { bookingStatus: status });
      fetchBookings(); // Refresh data
      Alert.alert('Success', `Booking status updated to ${status}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = async () => {
      try {
        await api.delete(`/bookings/admin/${id}`);
        setBookings(bookings.filter(b => b._id !== id));
        if (Platform.OS === 'web') {
          window.alert('Booking record has been removed.');
        } else {
          Alert.alert('Deleted', 'Booking record has been removed.');
        }
      } catch (err) {
        if (Platform.OS === 'web') {
          window.alert('Failed to delete booking');
        } else {
          Alert.alert('Error', 'Failed to delete booking');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this booking record?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this booking record?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#4CAF50';
      case 'Pending Payment': return '#FF9800';
      case 'Cancelled': return '#F44336';
      case 'Completed': return '#2196F3';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}><ActivityIndicator size="large" color="#c9a052" /></View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Admin</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Bookings</Text>
        <TouchableOpacity onPress={fetchBookings}>
          <Text style={styles.refreshBtn}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal>
        <View>
          {/* Table Header */}
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.cell, styles.headerCell, { width: 150 }]}>CUSTOMER</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 150 }]}>VEHICLE</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>DATES</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>AMOUNT</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 150 }]}>STATUS</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>ACTIONS</Text>
          </View>

          {/* Table Body */}
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {bookings.length === 0 ? (
              <Text style={styles.emptyTxt}>No bookings found in the system.</Text>
            ) : (
              bookings.map((b) => (
                <View key={b._id} style={styles.row}>
                  <View style={[styles.cell, { width: 150 }]}>
                    <Text style={styles.mainTxt}>{b.customerId?.fullName || 'N/A'}</Text>
                    <Text style={styles.subTxt}>{b.customerId?.email}</Text>
                  </View>
                  <View style={[styles.cell, { width: 150 }]}>
                    <Text style={styles.mainTxt}>{b.vehicleRentId?.name || 'N/A'}</Text>
                    <Text style={styles.subTxt}>{b.vehicleRentId?.brand}</Text>
                  </View>
                  <View style={[styles.cell, { width: 120 }]}>
                    <Text style={styles.mainTxt}>{new Date(b.startDate).toLocaleDateString()}</Text>
                    <Text style={styles.subTxt}>to {new Date(b.endDate).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.cell, styles.mainTxt, { width: 100 }]}>Rs.{b.totalCost?.toLocaleString()}</Text>
                  
                  <View style={[styles.cell, { width: 150 }]}>
                    <select 
                      style={{ 
                        backgroundColor: getStatusColor(b.bookingStatus), 
                        color: '#fff', 
                        padding: 5, 
                        borderRadius: 5,
                        border: 'none'
                      }}
                      value={b.bookingStatus}
                      onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                    >
                      <option value="Pending Payment">Pending Payment</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </View>

                  <View style={[styles.cell, { width: 120, flexDirection: 'row', gap: 10 }]}>
                    <TouchableOpacity onPress={() => handleDelete(b._id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnTxt}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  backBtn: { color: '#c9a052', fontWeight: 'bold' },
  refreshBtn: { fontSize: 20 },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  tableHeader: { backgroundColor: '#111318' },
  cell: { paddingHorizontal: 10, justifyContent: 'center' },
  headerCell: { color: '#c9a052', fontSize: 10, fontWeight: 'bold' },
  mainTxt: { fontSize: 13, fontWeight: '600', color: '#333' },
  subTxt: { fontSize: 11, color: '#888', marginTop: 2 },
  
  deleteBtn: { backgroundColor: '#ffebee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5 },
  deleteBtnTxt: { color: '#f44336', fontSize: 11, fontWeight: 'bold' },
  emptyTxt: { textAlign: 'center', padding: 50, color: '#888' }
});

export default AdminBookingsScreen;

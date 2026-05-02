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
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const RentalHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/my-bookings');
      // Filter only confirmed bookings for the rental history
      const confirmedBookings = response.data.filter(b => b.bookingStatus === 'Confirmed');
      setBookings(confirmedBookings);
    } catch (error) {
      if (Platform.OS === 'web') window.alert('Failed to load your rental history.');
      else Alert.alert('Error', 'Failed to load your rental history.');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setStars(5);
    setComment("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      if (Platform.OS === 'web') window.alert("Please write a comment.");
      else Alert.alert("Validation", "Please write a comment.");
      return;
    }

    try {
      setSubmittingReview(true);
      await api.post('/reviews/add', {
        vehicleRentId: selectedVehicleId,
        stars,
        comment
      });

      if (Platform.OS === 'web') window.alert("Review added successfully!");
      else Alert.alert('Success', "Review added successfully!");
      
      setShowReviewModal(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to add review.";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rental History</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#c9a052" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🚗</Text>
              <Text style={styles.emptyTxt}>You have no confirmed rentals yet.</Text>
            </View>
          ) : (
            bookings.map((b) => (
              <View key={b._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bookingId}>Booking #{b._id.substring(b._id.length - 6).toUpperCase()}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusTxt}>COMPLETED</Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.vehicleName}>🚙 {b.vehicleRentId?.name || 'Unknown Vehicle'}</Text>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateTxt}>📅 Pick-up: {new Date(b.startDate).toLocaleDateString()}</Text>
                    <Text style={styles.dateTxt}>📅 Return: {new Date(b.endDate).toLocaleDateString()}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.reviewBtn}
                  onPress={() => openReviewModal(b.vehicleRentId?._id)}
                >
                  <Text style={styles.reviewBtnTxt}>⭐ Rate & Review Vehicle</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent={true} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <Text style={styles.modalSub}>How was your experience with this vehicle?</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(num => (
                <TouchableOpacity key={num} onPress={() => setStars(num)}>
                  <Text style={[styles.starIcon, stars >= num ? styles.starSelected : styles.starUnselected]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Write your comment here..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReviewModal(false)} disabled={submittingReview}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={submittingReview}>
                {submittingReview ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnTxt}>Submit Review</Text>}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#f0ebe0', flexDirection: 'row', alignItems: 'center' },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },

  scrollContent: { padding: 20 },
  
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  bookingId: { fontSize: 12, fontWeight: 'bold', color: '#888' },
  
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9' },
  statusTxt: { fontSize: 10, fontWeight: 'bold', color: '#2e7d32' },

  cardBody: { marginBottom: 10 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: '#111318', marginBottom: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateTxt: { fontSize: 12, color: '#666' },

  reviewBtn: { backgroundColor: '#111318', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  reviewBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyTxt: { color: '#888', fontSize: 14 },

  // Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111318', marginBottom: 5 },
  modalSub: { fontSize: 13, color: '#666', marginBottom: 20 },
  
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 },
  starIcon: { fontSize: 40 },
  starSelected: { color: '#FFD700' },
  starUnselected: { color: '#e0e0e0' },
  
  commentInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', fontSize: 14, marginBottom: 20 },
  
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#f0f0f0' },
  cancelBtnTxt: { color: '#333', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#c9a052' },
  submitBtnTxt: { color: '#111318', fontWeight: 'bold' },
});

export default RentalHistoryScreen;

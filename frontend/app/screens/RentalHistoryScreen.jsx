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
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
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
      const [bookingsRes, reviewsRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/reviews/my-reviews') // We need to add this endpoint or filter manually
      ]);
      
      const confirmedBookings = bookingsRes.data.filter(b => b.bookingStatus === 'Confirmed');
      setBookings(confirmedBookings);
      setUserReviews(reviewsRes.data || []);
    } catch (error) {
      console.log('Fetch error:', error);
      Alert.alert('Error', 'Failed to load your rental history.');
    } finally {
      setLoading(false);
    }
  };

  const openAddReviewModal = (vehicleId) => {
    setIsEditing(false);
    setSelectedVehicleId(vehicleId);
    setStars(5);
    setComment("");
    setShowReviewModal(true);
  };

  const openEditReviewModal = (review) => {
    setIsEditing(true);
    setEditingReviewId(review._id);
    setStars(review.stars);
    setComment(review.comment);
    setShowReviewModal(true);
  };

  const handleDeleteReview = (id) => {
    const performDelete = async () => {
      try {
        await api.delete(`/reviews/${id}`);
        setUserReviews(userReviews.filter(r => r._id !== id));
        if (Platform.OS === 'web') window.alert('Review deleted');
        else Alert.alert('Deleted', 'Review deleted successfully');
      } catch (err) {
        Alert.alert('Error', 'Failed to delete review');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this review?')) performDelete();
    } else {
      Alert.alert('Delete Review', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      Alert.alert("Validation", "Please write a comment.");
      return;
    }

    try {
      setSubmittingReview(true);
      if (isEditing) {
        const res = await api.put(`/reviews/${editingReviewId}`, { stars, comment });
        setUserReviews(userReviews.map(r => r._id === editingReviewId ? res.data : r));
      } else {
        const res = await api.post('/reviews/add', { vehicleRentId: selectedVehicleId, stars, comment });
        setUserReviews([...userReviews, res.data]);
      }

      Alert.alert('Success', `Review ${isEditing ? 'updated' : 'added'} successfully!`);
      setShowReviewModal(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || "Action failed.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getReviewForVehicle = (vehicleId) => {
    return userReviews.find(r => r.vehicleRentId === vehicleId || r.vehicleRentId?._id === vehicleId);
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
            bookings.map((b) => {
              const review = getReviewForVehicle(b.vehicleRentId?._id);
              return (
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
                      <Text style={styles.dateTxt}>📅 {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  <View style={styles.reviewSection}>
                    {review ? (
                      <View style={styles.existingReview}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.yourReviewLabel}>Your Review:</Text>
                          <Text style={styles.reviewStars}>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</Text>
                          <Text style={styles.reviewComment} numberOfLines={1}>{review.comment}</Text>
                        </View>
                        <View style={styles.reviewActions}>
                          <TouchableOpacity onPress={() => openEditReviewModal(review)} style={styles.actionBtn}>
                            <Text>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteReview(review._id)} style={[styles.actionBtn, { backgroundColor: '#ffebee' }]}>
                            <Text>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.reviewBtn}
                        onPress={() => openAddReviewModal(b.vehicleRentId?._id)}
                      >
                        <Text style={styles.reviewBtnTxt}>⭐ Rate & Review Vehicle</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Review Modal (Shared for Add/Edit) */}
      <Modal visible={showReviewModal} transparent={true} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Review' : 'Write a Review'}</Text>
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
                {submittingReview ? <ActivityIndicator color="#111318" size="small" /> : <Text style={styles.submitBtnTxt}>{isEditing ? 'Update' : 'Submit'}</Text>}
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

  reviewSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  existingReview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
  yourReviewLabel: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  reviewStars: { color: '#c9a052', fontSize: 14, marginVertical: 2 },
  reviewComment: { fontSize: 12, color: '#555', fontStyle: 'italic' },
  reviewActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 35, height: 35, borderRadius: 8, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
});

export default RentalHistoryScreen;

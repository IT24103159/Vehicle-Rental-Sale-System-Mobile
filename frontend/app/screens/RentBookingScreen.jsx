import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const RentBookingScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const vehicle = route?.params?.vehicle || null;

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });

  const [isAvailable, setIsAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [costDetails, setCostDetails] = useState(null);
  
  // Date Picker States
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('startDate'); // 'startDate' or 'endDate'
  const [tempDate, setTempDate] = useState(new Date());

  const [promoCode, setPromoCode] = useState('');
  const [discountDetails, setDiscountDetails] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  
  const [reviews, setReviews] = useState([]);

  // Simple date format validation (YYYY-MM-DD) for mobile text input
  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false;
    return d.toISOString().slice(0, 10) === dateString;
  };

  const fetchReviews = async () => {
    if (!vehicle?._id) return;
    try {
      const response = await api.get(`/reviews/vehicle/${vehicle._id}`);
      setReviews(response.data);
    } catch (err) {
      console.log('Failed to fetch reviews', err);
    }
  };

  useEffect(() => {
    if (vehicle) {
      fetchReviews();
    }
  }, [vehicle]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      calculateTotalCost();
      checkAvailability(formData.startDate, formData.endDate);
    } else {
      setCostDetails(null);
      setDiscountDetails(null);
      setPromoError(null);
    }
  }, [formData.startDate, formData.endDate]);

  const onDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios'); // keep open on iOS, close on Android/Web
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        [pickerMode]: dateString
      }));
    }
  };

  const openPicker = (mode) => {
    setPickerMode(mode);
    const currentDate = formData[mode] ? new Date(formData[mode]) : new Date();
    setTempDate(currentDate);
    setShowPicker(true);
  };

  const checkAvailability = async (start, end) => {
    if (!vehicle?._id) return;
    setCheckingAvailability(true);
    try {
      const response = await api.get(`/bookings/check-availability?vehicleId=${vehicle._id}&startDate=${start}&endDate=${end}`);
      const available = response.data; // Assuming backend returns boolean
      setIsAvailable(available);
      if (!available) {
        Alert.alert('Notice', 'This vehicle is already booked for the selected dates.');
      }
    } catch (err) {
      console.log('Availability check failed', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateTotalCost = () => {
    if (vehicle) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDifference = end.getTime() - start.getTime();
      const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

      if (dayDifference > 0) {
        setCostDetails({
          days: dayDifference,
          total: dayDifference * vehicle.dailyRate
        });
      } else {
        setCostDetails(null);
      }
    }
  };

  const handleApplyPromo = async () => {
    if (!costDetails) {
      if (Platform.OS === 'web') window.alert('Please enter valid dates first.');
      else Alert.alert('Notice', 'Please enter valid dates first.');
      return;
    }
    if (!promoCode) return;

    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const res = await api.post('/promotions/verify', { code: promoCode });
      const promo = res.data;
      
      const discountAmount = (costDetails.total * promo.discountPercent) / 100;
      const finalPrice = costDetails.total - discountAmount;
      
      setDiscountDetails({
        appliedPromoCode: promo.code,
        discountPercent: promo.discountPercent,
        discountAmount,
        finalPrice
      });
      if (Platform.OS === 'web') window.alert(`Success: Promo code applied successfully! (${promo.discountPercent}% OFF)`);
      else Alert.alert('Success', `Promo code applied successfully! (${promo.discountPercent}% OFF)`);
    } catch (err) {
      setDiscountDetails(null);
      setPromoError(err.response?.data?.message || 'Invalid or expired promo code.');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleSubmit = async () => {
    const showAlert = (title, msg) => {
      if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
      else Alert.alert(title, msg);
    };

    if (!user) {
      showAlert('Login Required', 'You need to login to make a booking.');
      navigation.navigate('Login');
      return;
    }

    if (!isAvailable) {
      showAlert('Error', 'Cannot proceed. Vehicle is not available for these dates.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(formData.startDate);
    
    if (start < today) {
      showAlert('Error', 'Start date cannot be in the past.');
      return;
    }
    if (!costDetails) {
      showAlert('Error', 'Return date must be at or after the Pick-up date.');
      return;
    }

    const finalTotalCost = discountDetails ? discountDetails.finalPrice : costDetails.total;

    setSubmitting(true);
    try {
      const response = await api.post('/bookings/create', {
        customerId: user.userId || user._id,
        vehicleRentId: vehicle._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalCost: finalTotalCost,
        promoCode: discountDetails ? discountDetails.appliedPromoCode : null
      });

      if (Platform.OS === 'web') {
        window.alert('Booking Request Sent Successfully!');
        navigation.navigate('Payment', { 
          bookingId: response.data._id, 
          totalCost: finalTotalCost, 
          vehicleName: vehicle.name 
        });
      } else {
        Alert.alert('Success', 'Booking Request Sent Successfully!', [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Payment', { 
              bookingId: response.data._id, 
              totalCost: finalTotalCost, 
              vehicleName: vehicle.name 
            }) 
          }
        ]);
      }
      
    } catch (err) {
      console.error('Booking Error:', err);
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Unknown Error';
      const status = err.response?.status ? ` (Status: ${err.response.status})` : '';
      
      if (Platform.OS === 'web') {
        window.alert('Error Details: ' + msg + status);
      } else {
        Alert.alert('Error', msg + status);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><Text>Error: Vehicle not found</Text></View>
      </SafeAreaView>
    );
  }

  const currentTotal = discountDetails ? discountDetails.finalPrice : (costDetails ? costDetails.total : 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Vehicle Header Card */}
        <View style={styles.vehicleCard}>
          <Image source={{ uri: vehicle.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image' }} style={styles.vehicleImg} />
          <View style={styles.vehicleInfo}>
            <Text style={styles.vType}>{vehicle.type}</Text>
            <Text style={styles.vName}>{vehicle.name}</Text>
            <Text style={styles.vRate}>Rs. {vehicle.dailyRate?.toLocaleString()} <Text style={styles.vRateSub}>/ day</Text></Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PICK-UP DATE</Text>
            {Platform.OS === 'web' ? (
              <input 
                type="date" 
                style={styles.webDateInput}
                min={new Date().toISOString().split("T")[0]}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            ) : (
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => openPicker('startDate')}>
                <Text style={[styles.dateTxt, !formData.startDate && { color: '#aaa' }]}>
                  {formData.startDate || "Select Pick-up Date"}
                </Text>
                <Text>📅</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>RETURN DATE</Text>
            {Platform.OS === 'web' ? (
              <input 
                type="date" 
                style={styles.webDateInput}
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            ) : (
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => openPicker('endDate')}>
                <Text style={[styles.dateTxt, !formData.endDate && { color: '#aaa' }]}>
                  {formData.endDate || "Select Return Date"}
                </Text>
                <Text>📅</Text>
              </TouchableOpacity>
            )}
          </View>

          {showPicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              minimumDate={pickerMode === 'endDate' && formData.startDate ? new Date(formData.startDate) : new Date()}
              onChange={onDateChange}
            />
          )}

          {checkingAvailability && <Text style={styles.infoTxt}>Checking availability...</Text>}
          {!isAvailable && !checkingAvailability && <Text style={styles.errorTxt}>🚫 Not available for these dates</Text>}

          {/* Pricing Box */}
          {costDetails && (
            <View style={styles.pricingBox}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Rs. {vehicle.dailyRate?.toLocaleString()} × {costDetails.days} days</Text>
                <Text style={styles.priceValue}>Rs. {costDetails.total.toLocaleString()}</Text>
              </View>

              {discountDetails && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabelDiscount}>Discount ({discountDetails.discountPercent}%)</Text>
                  <Text style={styles.priceValueDiscount}>- Rs. {discountDetails.discountAmount.toLocaleString()}</Text>
                </View>
              )}

              {/* Promo Code Area */}
              <View style={styles.promoArea}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter Promo Code"
                  value={promoCode}
                  onChangeText={(t) => setPromoCode(t.toUpperCase())}
                  autoCapitalize="characters"
                  editable={!discountDetails}
                />
                <TouchableOpacity 
                  style={[styles.promoBtn, (isApplyingPromo || discountDetails || !promoCode) && styles.promoBtnDisabled]}
                  onPress={handleApplyPromo}
                  disabled={isApplyingPromo || discountDetails || !promoCode}
                >
                  <Text style={styles.promoBtnTxt}>{isApplyingPromo ? '...' : 'APPLY'}</Text>
                </TouchableOpacity>
              </View>
              {discountDetails && <Text style={styles.promoSuccess}>✓ Code {discountDetails.appliedPromoCode} applied!</Text>}
              {promoError && <Text style={styles.promoError}>✗ {promoError}</Text>}

              <View style={styles.divider} />

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total Fee</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  {discountDetails && <Text style={styles.strikeTxt}>Rs. {costDetails.total.toLocaleString()}</Text>}
                  <Text style={styles.totalValue}>Rs. {currentTotal.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitBtn, (!isAvailable || checkingAvailability || !costDetails) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isAvailable || checkingAvailability || !costDetails || submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Proceed to Book</Text>}
          </TouchableOpacity>

        </View>

        {/* --- REVIEWS SECTION --- */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsHeader}>Customer Reviews ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsTxt}>No reviews yet for this vehicle.</Text>
          ) : (
            reviews.map(rev => (
              <View key={rev._id} style={styles.reviewCard}>
                <View style={styles.revHeader}>
                  <Text style={styles.revName}>{rev.customerId?.fullName || 'Anonymous'}</Text>
                  <Text style={styles.revStars}>{'★'.repeat(rev.stars)}{'☆'.repeat(5 - rev.stars)}</Text>
                </View>
                {rev.comment ? <Text style={styles.revComment}>{rev.comment}</Text> : null}
                <Text style={styles.revDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#f0ebe0', flexDirection: 'row', alignItems: 'center' },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },

  vehicleCard: { backgroundColor: '#fff', margin: 15, borderRadius: 15, overflow: 'hidden', elevation: 2 },
  vehicleImg: { width: '100%', height: 180, resizeMode: 'cover' },
  vehicleInfo: { padding: 15 },
  vType: { fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 'bold' },
  vName: { fontSize: 22, fontWeight: 'bold', color: '#111318', marginVertical: 4 },
  vRate: { fontSize: 18, fontWeight: 'bold', color: '#c9a052' },
  vRateSub: { fontSize: 12, color: '#888', fontWeight: 'normal' },

  formCard: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 15, padding: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, fontSize: 14 },

  datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 15 },
  dateTxt: { fontSize: 14, color: '#111318' },
  webDateInput: { padding: '12px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#f9f9f9', fontSize: '14px', width: '100%' },

  infoTxt: { color: '#c9a052', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  errorTxt: { color: '#ef4444', fontSize: 12, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },

  pricingBox: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#eee' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  priceLabel: { color: '#555', fontSize: 13 },
  priceValue: { color: '#111318', fontWeight: 'bold', fontSize: 13 },
  
  priceLabelDiscount: { color: '#2e7d32', fontSize: 13 },
  priceValueDiscount: { color: '#2e7d32', fontWeight: 'bold', fontSize: 13 },

  promoArea: { flexDirection: 'row', marginTop: 10, gap: 10 },
  promoInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, fontSize: 12 },
  promoBtn: { backgroundColor: '#111318', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  promoBtnDisabled: { backgroundColor: '#ccc' },
  promoBtnTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  promoSuccess: { color: '#2e7d32', fontSize: 10, marginTop: 5 },
  promoError: { color: '#ef4444', fontSize: 10, marginTop: 5 },

  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 12 },
  
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#111318' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#c9a052' },
  strikeTxt: { fontSize: 12, color: '#888', textDecorationLine: 'line-through' },

  submitBtn: { backgroundColor: '#111318', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  submitBtnDisabled: { backgroundColor: '#aaa' },
  submitBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  reviewsSection: { marginTop: 30, paddingHorizontal: 15 },
  reviewsHeader: { fontSize: 16, fontWeight: 'bold', color: '#111318', marginBottom: 15 },
  noReviewsTxt: { color: '#888', fontStyle: 'italic', fontSize: 13 },
  reviewCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee', elevation: 1 },
  revHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  revName: { fontWeight: 'bold', color: '#333', fontSize: 13 },
  revStars: { color: '#c9a052', fontSize: 14 },
  revComment: { color: '#555', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  revDate: { color: '#aaa', fontSize: 10, textAlign: 'right' }
});

export default RentBookingScreen;

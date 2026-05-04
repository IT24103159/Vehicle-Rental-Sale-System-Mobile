import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';

const PaymentScreen = ({ route, navigation }) => {
  const { bookingId, totalCost, vehicleName } = route?.params || {};

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankSlipFile, setBankSlipFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      Alert.alert('Error', 'No booking information found.');
      navigation.goBack();
    }
  }, [bookingId]);

  const onDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPaymentDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const openPicker = () => {
    setTempDate(new Date(paymentDate));
    setShowPicker(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
         if (Platform.OS === 'web') window.alert("Only PDF, JPEG, and PNG files are allowed.");
         else Alert.alert('Error', "Only PDF, JPEG, and PNG files are allowed.");
         e.target.value = null;
         return;
      }
      setBankSlipFile(file);
      // Create a local URL for previewing images
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(''); // For PDF etc.
      }
    }
  };

  const handleUploadPayment = async () => {
    if (!bankSlipFile) {
      Alert.alert('Validation', 'Please browse and select a Bank Slip (PDF/JPG/PNG).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('amount', totalCost);
      formData.append('paymentDate', paymentDate);
      formData.append('bankSlip', bankSlipFile);

      await api.post('/payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (Platform.OS === 'web') {
        window.alert('Payment Uploaded Successfully! Your booking will be confirmed after admin approval.');
        navigation.navigate('HomeTab', { screen: 'HomeMain' });
      } else {
        Alert.alert(
          'Success', 
          'Payment Uploaded Successfully! Your booking will be confirmed after admin approval.', 
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('HomeTab', { screen: 'HomeMain' }) 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    const confirmCancel = async () => {
      setCancelling(true);
      try {
        await api.delete(`/bookings/${bookingId}`);
        if (Platform.OS === 'web') {
          window.alert('Your booking has been cancelled successfully.');
          navigation.navigate('DashboardTab');
        } else {
          Alert.alert('Cancelled', 'Your booking has been cancelled successfully.', [
            { text: 'OK', onPress: () => navigation.navigate('DashboardTab') }
          ]);
        }
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking.');
      } finally {
        setCancelling(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this booking?')) confirmCancel();
    } else {
      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking? This action cannot be undone.',
        [
          { text: 'No, Keep it', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: confirmCancel }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={loading || cancelling}>
          <Text style={styles.backBtnTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount Due</Text>
          <Text style={styles.amountValue}>Rs. {totalCost?.toLocaleString()}</Text>
          <Text style={styles.bookingRef}>Booking Ref: #{bookingId?.substring(bookingId.length - 6).toUpperCase()}</Text>
          <Text style={styles.vehicleName}>{vehicleName}</Text>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionTxt}>
            Please deposit the above amount into our bank account and upload the bank slip below.
          </Text>
          <Text style={[styles.instructionTxt, { marginTop: 10, fontWeight: 'bold' }]}>
            Bank: Commercial Bank{'\n'}
            A/C: 1000 2345 6789{'\n'}
            Name: Samarasinghe Motors
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAYMENT DATE</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                style={styles.webDateInput}
                min={new Date().toISOString().split('T')[0]}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            ) : (
              <TouchableOpacity style={styles.datePickerBtn} onPress={openPicker}>
                <Text style={styles.dateTxt}>{paymentDate}</Text>
                <Text>📅</Text>
              </TouchableOpacity>
            )}
          </View>

          {showPicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>UPLOAD BANK SLIP (PDF / JPG / PNG)</Text>
            <input
              type="file"
              accept=".pdf, image/jpeg, image/png"
              style={styles.webFileInput}
              onChange={handleFileChange}
            />
          </View>

          {previewUrl ? (
            <Image source={{ uri: previewUrl }} style={styles.previewImg} />
          ) : bankSlipFile && bankSlipFile.type === 'application/pdf' ? (
            <View style={styles.pdfPreview}>
              <Text style={styles.pdfTxt}>📄 Selected: {bankSlipFile.name}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleUploadPayment}
            disabled={loading || cancelling}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Upload Payment</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancelBooking}
          disabled={loading || cancelling}
        >
          {cancelling ? <ActivityIndicator color="#ef4444" /> : <Text style={styles.cancelBtnTxt}>Cancel Booking</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  header: { padding: 20, backgroundColor: '#f0ebe0', flexDirection: 'row', alignItems: 'center' },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },

  amountCard: { backgroundColor: '#111318', borderRadius: 16, padding: 25, alignItems: 'center', marginBottom: 20, elevation: 4 },
  amountLabel: { color: '#8a94a8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  amountValue: { color: '#c9a052', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  bookingRef: { color: '#fff', fontSize: 12, opacity: 0.8 },
  vehicleName: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 5 },

  instructionCard: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9', borderRadius: 12, padding: 15, marginBottom: 20 },
  instructionTxt: { color: '#2e7d32', fontSize: 13, lineHeight: 20, textAlign: 'center' },

  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 15 },
  dateTxt: { fontSize: 14, color: '#111318' },
  webDateInput: { padding: '12px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#f9f9f9', fontSize: '14px', width: '100%' },
  webFileInput: { padding: '12px', borderRadius: '8px', border: '1px dashed #c9a052', backgroundColor: '#fdfbf7', fontSize: '14px', width: '100%', cursor: 'pointer' },

  previewImg: { width: '100%', height: 150, borderRadius: 8, resizeMode: 'cover', marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  pdfPreview: { width: '100%', padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  pdfTxt: { color: '#111318', fontSize: 13, fontWeight: 'bold' },

  submitBtn: { backgroundColor: '#c9a052', padding: 16, borderRadius: 10, alignItems: 'center' },
  submitBtnTxt: { color: '#111318', fontWeight: 'bold', fontSize: 16 },

  cancelBtn: { padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444', backgroundColor: '#fff' },
  cancelBtnTxt: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});

export default PaymentScreen;

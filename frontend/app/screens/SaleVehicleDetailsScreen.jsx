import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import api from '../../services/api';
import { showAlert } from '../../services/alertHelper';
import CustomHeader from '../components/CustomHeader';

const SaleVehicleDetailsScreen = ({ route, navigation }) => {
  const { vehicle } = route.params;
  const [loading, setLoading] = useState(false);

  // Inquiry Modal State
  const [showModal, setShowModal] = useState(false);
  const [inquiryType, setInquiryType] = useState('NEGOTIATION'); // or 'BUY_NOW'
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openScanReport = () => {
    if (vehicle.scanReportUrl) {
      // If it's a relative URL, prepend BASE_URL, else use as is
      const { getAssetsBaseUrl } = require('../../services/api');
      const url = vehicle.scanReportUrl.startsWith('http') 
        ? vehicle.scanReportUrl 
        : `${getAssetsBaseUrl()}${vehicle.scanReportUrl}`;
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const handleInquire = (type) => {
    setInquiryType(type);
    setMessage(type === 'BUY_NOW' ? 'I am interested in purchasing this vehicle immediately.' : '');
    setShowModal(true);
  };

  const submitInquiry = async () => {
    if (!message.trim()) {
      showAlert("Validation Error", "Please enter a message");
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/inquiries/inquire', {
        vehicleSaleId: vehicle._id,
        inquiryType: inquiryType,
        message: message.trim()
      });

      showAlert('Success', "Inquiry sent successfully!", () => {
        setShowModal(false);
        navigation.goBack();
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send inquiry.";
      showAlert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <CustomHeader title={`${vehicle.brand} ${vehicle.name}`} showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Simple Image (Or Carousel if implemented later) */}
        <View style={styles.imageContainer}>
           <Image 
             source={{ uri: vehicle.images?.[0] || 'https://via.placeholder.com/400' }} 
             style={styles.mainImage} 
           />
           {vehicle.images?.length > 1 && (
             <View style={styles.imageBadge}>
               <Text style={styles.imageBadgeTxt}>+ {vehicle.images.length - 1} more photos</Text>
             </View>
           )}
        </View>

        {/* Basic Info */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{vehicle.brand} {vehicle.name}</Text>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionTxt}>{vehicle.conditionStatus}</Text>
            </View>
          </View>
          <Text style={styles.price}>Rs. {(vehicle.price / 1000000).toFixed(1)}M</Text>

          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>📅</Text>
              <Text style={styles.specLabel}>Year</Text>
              <Text style={styles.specValue}>{vehicle.yearReg || vehicle.yom}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>🛣️</Text>
              <Text style={styles.specLabel}>Mileage</Text>
              <Text style={styles.specValue}>{vehicle.mileage?.toLocaleString()} km</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>⚙️</Text>
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{vehicle.transmission}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>⛽</Text>
              <Text style={styles.specLabel}>Body</Text>
              <Text style={styles.specValue}>{vehicle.bodyType}</Text>
            </View>
          </View>

          {vehicle.description ? (
            <Text style={styles.description}>{vehicle.description}</Text>
          ) : null}
        </View>

        {/* Scan Report Button */}
        <TouchableOpacity 
          style={[styles.reportBtn, !vehicle.scanReportUrl && styles.reportBtnDisabled]}
          disabled={!vehicle.scanReportUrl}
          onPress={openScanReport}
        >
          <Text style={styles.reportBtnTxt}>
            📄 {vehicle.scanReportUrl ? "View Official Scan Report" : "No Scan Report Available"}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.negotiateBtn} onPress={() => handleInquire('NEGOTIATION')}>
            <Text style={styles.negotiateBtnTxt}>💬 Negotiate Price</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyBtn} onPress={() => handleInquire('BUY_NOW')}>
            <Text style={styles.buyBtnTxt}>🛒 Buy Now</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Inquiry Modal */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {inquiryType === 'NEGOTIATION' ? 'Negotiate Price' : 'Confirm Purchase Intent'}
            </Text>
            <Text style={styles.modalSub}>
              {inquiryType === 'NEGOTIATION' 
                ? 'Enter your offer or questions below. Our team will review and reply.' 
                : 'Send a definitive request to purchase this vehicle.'}
            </Text>

            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)} disabled={submitting}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitInquiry} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#0f1117" size="small" /> : <Text style={styles.submitBtnTxt}>Send Inquiry</Text>}
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
  imageContainer: { borderRadius: 15, overflow: 'hidden', backgroundColor: '#fff', marginBottom: 20, elevation: 2 },
  mainImage: { width: '100%', height: 250, resizeMode: 'cover' },
  imageBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  imageBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  infoCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 2, marginBottom: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111318', flex: 1 },
  conditionBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  conditionTxt: { color: '#2e7d32', fontWeight: 'bold', fontSize: 10 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#c9a052', marginTop: 10, marginBottom: 20 },

  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  specBox: { width: '48%', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  specIcon: { fontSize: 20, marginBottom: 5 },
  specLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase' },
  specValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },

  description: { marginTop: 15, color: '#555', lineHeight: 22, fontSize: 14 },

  reportBtn: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  reportBtnDisabled: { opacity: 0.5 },
  reportBtnTxt: { color: '#334155', fontWeight: 'bold', fontSize: 14 },

  actionRow: { flexDirection: 'row' },
  negotiateBtn: { flex: 1, backgroundColor: '#333', padding: 16, borderRadius: 10, alignItems: 'center' },
  negotiateBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  buyBtn: { flex: 1, backgroundColor: '#c9a052', padding: 16, borderRadius: 10, alignItems: 'center' },
  buyBtnTxt: { color: '#111318', fontWeight: 'bold', fontSize: 14 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111318', marginBottom: 5 },
  modalSub: { fontSize: 13, color: '#666', marginBottom: 20 },
  messageInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', fontSize: 14, marginBottom: 20 },
  modalActions: { flexDirection: 'row' },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#f0f0f0' },
  cancelBtnTxt: { color: '#333', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#c9a052' },
  submitBtnTxt: { color: '#111318', fontWeight: 'bold' },
});

export default SaleVehicleDetailsScreen;

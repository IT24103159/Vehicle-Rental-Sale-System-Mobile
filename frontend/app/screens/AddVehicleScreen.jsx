import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, 
  SafeAreaView, StatusBar, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../services/api';

const AddVehicleScreen = ({ route, navigation }) => {
  const isEditing = !!route?.params?.vehicle;
  const editType = route?.params?.type || 'rent';
  const vehicle = route?.params?.vehicle || {};

  const [activeTab, setActiveTab] = useState(isEditing ? editType : 'rent');
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState(vehicle.images || []);
  const [scanReport, setScanReport] = useState(null);

  useEffect(() => {
    setSelectedImages([]);
  }, [activeTab]);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = [...selectedImages, ...result.assets.map(asset => asset.uri)].slice(0, 5);
      setSelectedImages(newImages);
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const pickScanReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setScanReport(result.assets[0]);
      }
    } catch (error) {
      console.log('Error picking document', error);
      Alert.alert("Error", "Could not pick PDF document.");
    }
  };

  const removeScanReport = () => {
    setScanReport(null);
    setSaleData({ ...saleData, scanReportUrl: '' });
  };

  // Form States for Rent
  const [rentData, setRentData] = useState({
    name: vehicle.name || '', type: vehicle.type || '', year: vehicle.year || '', 
    dailyRate: vehicle.dailyRate || '', mileageLimit: vehicle.mileageLimit || '',
    extraMileageCharge: vehicle.extraMileageCharge || '', gearType: vehicle.gearType || 'Auto', 
    fuelType: vehicle.fuelType || 'Petrol', seats: vehicle.seats || '', 
    avgFuelEfficiency: vehicle.avgFuelEfficiency || '', status: vehicle.status || 'Available', 
    description: vehicle.description || ''
  });

  // Form States for Sale
  const [saleData, setSaleData] = useState({
    name: vehicle.name || '', brand: vehicle.brand || '', bodyType: vehicle.bodyType || '', 
    yom: vehicle.yom || '', yearReg: vehicle.yearReg || '', price: vehicle.price || '',
    transmission: vehicle.transmission || 'Auto', conditionStatus: vehicle.conditionStatus || 'Used', 
    mileage: vehicle.mileage || '', engineCap: vehicle.engineCap || '', color: vehicle.color || '', 
    status: vehicle.status || 'Available', edition: vehicle.edition || '',
    scanReportUrl: vehicle.scanReportUrl || '', description: vehicle.description || ''
  });

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const validateForm = (data) => {
    // Required fields for Rent
    const rentRequired = ['name', 'type', 'year', 'dailyRate', 'mileageLimit', 'extraMileageCharge', 'seats', 'avgFuelEfficiency', 'description'];
    // Required fields for Sale
    const saleRequired = ['name', 'brand', 'price', 'yom', 'yearReg', 'bodyType', 'mileage', 'color', 'engineCap', 'description'];

    const fieldsToCheck = activeTab === 'rent' ? rentRequired : saleRequired;

    for (const field of fieldsToCheck) {
      if (data[field] === undefined || data[field] === null || data[field].toString().trim() === '') {
        const fieldLabel = field.replace(/([A-Z])/g, ' $1').toUpperCase();
        showAlert('Missing Field', `Please enter the ${fieldLabel}.`);
        return false;
      }
    }

    if (selectedImages.length === 0) {
      showAlert('Missing Image', 'Please provide at least one vehicle image.');
      return false;
    }

    const numericFields = activeTab === 'rent' 
      ? ['year', 'dailyRate', 'mileageLimit', 'extraMileageCharge', 'seats']
      : ['yom', 'yearReg', 'price', 'mileage'];

    for (const field of numericFields) {
      if (data[field] !== '' && (isNaN(Number(data[field])) || Number(data[field]) < 0)) {
        showAlert('Invalid Value', `${field.toUpperCase()} must be a valid positive number.`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    const data = activeTab === 'rent' ? rentData : saleData;

    console.log('--- ATTEMPTING TO SAVE ---');
    console.log('Active Tab:', activeTab);
    if (!validateForm(data)) return;

    try {
      setLoading(true);
      const endpoint = activeTab === 'rent' ? '/vehicles/rent' : '/vehicles/sale';
      const payload = activeTab === 'rent' ? rentData : saleData;

      // Use FormData for image upload
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key]);
        }
      });

      // Append Images
      for (const [index, uri] of selectedImages.entries()) {
        if (!uri.startsWith('http')) { // Only upload new local images
          if (Platform.OS === 'web') {
            const res = await fetch(uri);
            const blob = await res.blob();
            formData.append('images', blob, `upload_${index}.jpg`);
          } else {
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            
            formData.append('images', {
              uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
              name: filename,
              type
            });
          }
        } else {
          formData.append('existingImages', uri);
        }
      }

      // Append Scan Report for Sale Vehicle
      if (activeTab === 'sale' && scanReport) {
        if (Platform.OS === 'web') {
          const res = await fetch(scanReport.uri);
          const blob = await res.blob();
          formData.append('scanReport', blob, scanReport.name || 'report.pdf');
        } else {
          formData.append('scanReport', {
            uri: Platform.OS === 'ios' ? scanReport.uri.replace('file://', '') : scanReport.uri,
            name: scanReport.name || 'report.pdf',
            type: scanReport.mimeType || 'application/pdf'
          });
        }
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (isEditing) {
        await api.put(`${endpoint}/${vehicle._id}`, formData, config);
      } else {
        await api.post(endpoint, formData, config);
      }

      setLoading(false);
      if (Platform.OS === 'web') {
        window.alert(`Success: Vehicle ${isEditing ? 'updated' : 'saved'} successfully!`);
        navigation.navigate('DashboardTab', { screen: 'AdminHome' });
      } else {
        Alert.alert('Success', `Vehicle ${isEditing ? 'updated' : 'saved'} successfully!`, [
          { text: 'OK', onPress: () => navigation.navigate('DashboardTab', { screen: 'AdminHome' }) }
        ]);
      }
      
    } catch (error) {
      setLoading(false);
      console.error('Save Error:', error.response?.data || error.message);
      if (Platform.OS === 'web') {
        window.alert('Error: ' + (error.response?.data?.message || 'Failed to save vehicle'));
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to save vehicle');
      }
    }
  };

  const renderInput = (label, value, onChange, placeholder, keyboard = 'default', half = false) => (
    <View style={[styles.inputGroup, half && { width: '48%' }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value.toString()}
        onChangeText={(t) => {
          if (keyboard === 'numeric' && t.includes('-')) return;
          onChange(t);
        }}
        placeholder={placeholder}
        keyboardType={keyboard}
      />
    </View>
  );

  const renderDropdown = (label, value, options, onSelect, half = false) => (
    <View style={[styles.inputGroup, half && { width: '48%' }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map((opt) => (
          <TouchableOpacity 
            key={opt} 
            style={[styles.optBtn, value === opt && styles.optBtnActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optBtnTxt, value === opt && styles.optBtnTxtActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backTxt}>✕ Close</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit' : 'Add'} {activeTab === 'rent' ? 'Rent' : 'Sale'} Vehicle</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'rent' && styles.activeTab, isEditing && editType !== 'rent' && { opacity: 0.5 }]} 
            onPress={() => !isEditing && setActiveTab('rent')}
            disabled={isEditing}
          >
            <Text style={[styles.tabTxt, activeTab === 'rent' && styles.activeTabTxt]}>RENT</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'sale' && styles.activeTab, isEditing && editType !== 'sale' && { opacity: 0.5 }]} 
            onPress={() => !isEditing && setActiveTab('sale')}
            disabled={isEditing}
          >
            <Text style={[styles.tabTxt, activeTab === 'sale' && styles.activeTabTxt]}>SALE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            
            {selectedImages.length > 0 ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImages[0] }} style={styles.previewImg} />
                <Text style={styles.infoHint}>Main Image Preview</Text>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderTxt}>No images selected yet</Text>
              </View>
            )}

            {activeTab === 'rent' ? (
              <View>
                <View style={styles.row}>
                  {renderInput('NAME', rentData.name, (t) => setRentData({...rentData, name: t}), 'e.g. Axio', 'default', true)}
                  {renderInput('TYPE', rentData.type, (t) => setRentData({...rentData, type: t}), 'Sedan', 'default', true)}
                </View>
                <View style={styles.row}>
                  {renderInput('YEAR', rentData.year, (t) => setRentData({...rentData, year: t}), '2024', 'numeric', true)}
                  {renderInput('DAILY RATE (RS.)', rentData.dailyRate, (t) => setRentData({...rentData, dailyRate: t}), '5000', 'numeric', true)}
                </View>
                <View style={styles.row}>
                  {renderInput('MILEAGE LIMIT', rentData.mileageLimit, (t) => setRentData({...rentData, mileageLimit: t}), '100', 'numeric', true)}
                  {renderInput('EXTRA MILEAGE (RS)', rentData.extraMileageCharge, (t) => setRentData({...rentData, extraMileageCharge: t}), '50', 'numeric', true)}
                </View>
                <View style={styles.row}>
                  {renderDropdown('GEAR TYPE', rentData.gearType, ['Auto', 'Manual'], (v) => setRentData({...rentData, gearType: v}), true)}
                  {renderInput('SEATS', rentData.seats, (t) => setRentData({...rentData, seats: t}), '4', 'numeric', true)}
                </View>
                {renderDropdown('FUEL TYPE', rentData.fuelType, ['Petrol', 'Diesel', 'Hybrid', 'Electric'], (v) => setRentData({...rentData, fuelType: v}))}
                <View style={styles.row}>
                  {renderInput('FUEL EFFICIENCY', rentData.avgFuelEfficiency, (t) => setRentData({...rentData, avgFuelEfficiency: t}), '15', 'default', true)}
                  {renderDropdown('STATUS', rentData.status, ['Available', 'Reserved', 'Rented'], (v) => setRentData({...rentData, status: v}), true)}
                </View>

                {/* --- IMAGE PICKER UI --- */}
                <Text style={styles.label}>VEHICLE IMAGES (MAX 5)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.previewImg} />
                      <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(index)}>
                        <Text style={styles.removeImgTxt}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {selectedImages.length < 5 && (
                    <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                      <Text style={styles.addImageTxt}>+</Text>
                      <Text style={{ fontSize: 10, color: '#888' }}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionDivider}>BASIC INFORMATION</Text>
                <View style={styles.row}>
                  {renderInput('VEHICLE NAME', saleData.name, (t) => setSaleData({...saleData, name: t}), 'e.g. Civic', 'default', true)}
                  {renderInput('BRAND', saleData.brand, (t) => setSaleData({...saleData, brand: t}), 'e.g. Honda', 'default', true)}
                </View>
                <View style={styles.row}>
                  {renderDropdown('CONDITION', saleData.conditionStatus, ['Brand New', 'Registered', 'Reconditioned'], (v) => setSaleData({...saleData, conditionStatus: v}), true)}
                  {renderDropdown('TRANSMISSION', saleData.transmission, ['Auto', 'Manual', 'Tiptronic'], (v) => setSaleData({...saleData, transmission: v}), true)}
                </View>

                <Text style={[styles.sectionDivider, { marginTop: 20 }]}>TECHNICAL SPECS</Text>
                <View style={styles.row}>
                  {renderInput('YOM', saleData.yom, (t) => setSaleData({...saleData, yom: t}), '2020', 'numeric', true)}
                  {renderInput('REG YEAR', saleData.yearReg, (t) => setSaleData({...saleData, yearReg: t}), '2021', 'numeric', true)}
                </View>
                <View style={styles.row}>
                  {renderInput('BODY TYPE', saleData.bodyType, (t) => setSaleData({...saleData, bodyType: t}), 'SUV / Sedan', 'default', true)}
                  {renderInput('COLOR', saleData.color, (t) => setSaleData({...saleData, color: t}), 'White / Black', 'default', true)}
                </View>
                <View style={styles.row}>
                  {renderInput('MILEAGE (KM)', saleData.mileage, (t) => setSaleData({...saleData, mileage: t}), '15000', 'numeric', true)}
                  {renderInput('ENGINE CAPACITY', saleData.engineCap, (t) => setSaleData({...saleData, engineCap: t}), 'e.g. 1500cc', 'default', true)}
                </View>
                <View style={styles.row}>
                  {renderDropdown('STATUS', saleData.status, ['Available', 'Sold'], (v) => setSaleData({...saleData, status: v}), true)}
                </View>

                <Text style={[styles.sectionDivider, { marginTop: 20 }]}>PRICING & MEDIA</Text>
                <View style={styles.row}>
                  {renderInput('PRICE (RS.)', saleData.price, (t) => setSaleData({...saleData, price: t}), '8500000', 'numeric', true)}
                </View>

                {/* --- IMAGE PICKER UI --- */}
                <Text style={styles.label}>VEHICLE IMAGES (MAX 5)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.previewImg} />
                      <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(index)}>
                        <Text style={styles.removeImgTxt}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {selectedImages.length < 5 && (
                    <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                      <Text style={styles.addImageTxt}>+</Text>
                      <Text style={{ fontSize: 10, color: '#888' }}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {/* --- PDF UPLOAD UI --- */}
                <Text style={[styles.sectionDivider, { marginTop: 10 }]}>DOCUMENTS</Text>
                <Text style={styles.label}>VEHICLE HEALTH SCAN REPORT (PDF ONLY)</Text>
                {scanReport || saleData.scanReportUrl ? (
                  <View style={styles.pdfContainer}>
                    <Text style={styles.pdfText}>📄 {scanReport ? scanReport.name : 'Existing Report'}</Text>
                    <TouchableOpacity onPress={removeScanReport} style={styles.removePdfBtn}>
                      <Text style={styles.removePdfTxt}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadPdfBtn} onPress={pickScanReport}>
                    <Text style={styles.uploadPdfTxt}>+ Upload PDF Report</Text>
                  </TouchableOpacity>
                )}

              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                value={activeTab === 'rent' ? rentData.description : saleData.description}
                onChangeText={(t) => activeTab === 'rent' ? setRentData({...rentData, description: t}) : setSaleData({...saleData, description: t})}
                multiline
                placeholder="Description..."
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>{isEditing ? 'Update' : 'Save'} Vehicle</Text>}
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backTxt: { color: '#888', marginRight: 15 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  infoHint: { fontSize: 10, color: '#c9a052', marginTop: 5, textAlign: 'center' },
  sectionDivider: { fontSize: 11, fontWeight: 'bold', color: '#c9a052', marginBottom: 15, letterSpacing: 1 },
  
  tabContainer: { flexDirection: 'row', padding: 15, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#ddd' },
  activeTab: { backgroundColor: '#111318' },
  tabTxt: { fontSize: 11, fontWeight: 'bold', color: '#666' },
  activeTabTxt: { color: '#fff' },

  scrollContent: { paddingHorizontal: 15 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#eee' },
  
  previewContainer: { marginBottom: 20, alignItems: 'center' },
  previewImg: { width: '100%', height: 180, borderRadius: 10, resizeMode: 'cover' },
  clearImg: { marginTop: 8, padding: 5 },
  clearImgTxt: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  imagePlaceholder: { height: 100, backgroundColor: '#f8f9fa', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  placeholderTxt: { fontSize: 11, color: '#999' },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#c9a052', marginBottom: 6 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, fontSize: 13 },
  
  pickerContainer: { flexDirection: 'row', gap: 5 },
  optBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderWidth: 1, borderColor: '#ddd' },
  optBtnActive: { backgroundColor: '#111318', borderColor: '#111318' },
  optBtnTxt: { fontSize: 11, color: '#666' },
  optBtnTxtActive: { color: '#fff' },

  saveBtn: { backgroundColor: '#111318', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Image Picker Styles
  imageScroll: { flexDirection: 'row', marginTop: 10, marginBottom: 20 },
  imageWrapper: { marginRight: 15, position: 'relative' },
  previewImg: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#eee' },
  removeImgBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  removeImgTxt: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  addImageBtn: { width: 100, height: 100, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
  addImageTxt: { fontSize: 30, color: '#aaa', marginBottom: 2 },

  // PDF Styles
  uploadPdfBtn: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', alignItems: 'center', marginBottom: 15 },
  uploadPdfTxt: { color: '#c9a052', fontWeight: 'bold', fontSize: 12 },
  pdfContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  pdfText: { color: '#333', flex: 1, marginRight: 10, fontSize: 12 },
  removePdfBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  removePdfTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

export default AddVehicleScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../../services/api';

const AddVehicleScreen = ({ route, navigation }) => {
  const isEditing = !!route?.params?.vehicle;
  const editType = route?.params?.type || 'rent';
  const vehicle = route?.params?.vehicle || {};

  const [activeTab, setActiveTab] = useState(isEditing ? editType : 'rent');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(vehicle.images?.[0] || '');

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

  const validateForm = (data) => {
    const numericFields = activeTab === 'rent' 
      ? ['year', 'dailyRate', 'mileageLimit', 'extraMileageCharge', 'seats']
      : ['yom', 'yearReg', 'price', 'mileage'];

    for (const field of numericFields) {
      if (data[field] && Number(data[field]) < 0) {
        Alert.alert('Validation Error', `${field.toUpperCase()} cannot be a negative value.`);
        return false;
      }
    }

    if (!data.name) {
      Alert.alert('Validation Error', 'Vehicle Name is required.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    const data = activeTab === 'rent' ? rentData : saleData;

    if (!validateForm(data)) return;

    try {
      setLoading(true);
      const endpoint = activeTab === 'rent' ? '/vehicles/rent' : '/vehicles/sale';
      const fullEndpoint = isEditing ? `${endpoint}/${vehicle._id}` : endpoint;
      
      const payload = { 
        ...data, 
        images: imageUrl ? [imageUrl] : [] 
      };
      
      console.log('--- Sending to Backend ---');
      console.log('Endpoint:', fullEndpoint);
      console.log('Payload:', payload);

      if (isEditing) {
        await api.put(fullEndpoint, payload);
      } else {
        await api.post(fullEndpoint, payload);
      }
      
      // Navigate back immediately and show alert to prevent double clicks
      navigation.goBack();
      Alert.alert('Success', `Vehicle ${isEditing ? 'updated' : 'saved'} successfully!`);
      
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save vehicle');
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
            
            {/* Image URL Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>VEHICLE IMAGE URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Paste image link here (e.g. https://...)"
              />
            </View>

            {imageUrl ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUrl }} style={styles.previewImg} />
                <TouchableOpacity style={styles.clearImg} onPress={() => setImageUrl('')}>
                  <Text style={styles.clearImgTxt}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderTxt}>No image preview available</Text>
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
              </View>
            ) : (
              <View>
                <View style={styles.row}>
                  {renderInput('NAME', saleData.name, (t) => setSaleData({...saleData, name: t}), 'e.g. Premio', 'default', true)}
                  {renderInput('BRAND', saleData.brand, (t) => setSaleData({...saleData, brand: t}), 'Toyota', 'default', true)}
                </View>
                <View style={styles.row}>
                  {renderInput('PRICE (RS.)', saleData.price, (t) => setSaleData({...saleData, price: t}), '8500000', 'numeric', true)}
                  {renderInput('YOM', saleData.yom, (t) => setSaleData({...saleData, yom: t}), '2020', 'numeric', true)}
                </View>
                <View style={styles.row}>
                  {renderDropdown('TRANSMISSION', saleData.transmission, ['Auto', 'Manual'], (v) => setSaleData({...saleData, transmission: v}), true)}
                  {renderDropdown('CONDITION', saleData.conditionStatus, ['Used', 'New', 'Recon'], (v) => setSaleData({...saleData, conditionStatus: v}), true)}
                </View>
                <View style={styles.row}>
                  {renderInput('MILEAGE (KM)', saleData.mileage, (t) => setSaleData({...saleData, mileage: t}), '0', 'numeric', true)}
                  {renderDropdown('STATUS', saleData.status, ['Available', 'Sold'], (v) => setSaleData({...saleData, status: v}), true)}
                </View>
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
  saveBtnTxt: { color: '#fff', fontWeight: 'bold' },
});

export default AddVehicleScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import api from '../../services/api';

const BuyGalleryScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [year, setYear] = useState('');
  const [condition, setCondition] = useState('All');
  const [transmission, setTransmission] = useState('Any');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles/sale');
      setVehicles(res.data);
      setFilteredVehicles(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let temp = [...vehicles];

    if (brand) temp = temp.filter(v => v.brand?.toLowerCase().includes(brand.toLowerCase()));
    if (model) temp = temp.filter(v => v.name?.toLowerCase().includes(model.toLowerCase()));
    if (bodyType) temp = temp.filter(v => v.bodyType?.toLowerCase().includes(bodyType.toLowerCase()));
    if (year) temp = temp.filter(v => v.yearReg === parseInt(year) || v.yom === parseInt(year));
    if (condition !== 'All') temp = temp.filter(v => v.conditionStatus === condition);
    if (transmission !== 'Any') temp = temp.filter(v => v.transmission === transmission);
    if (maxPrice) temp = temp.filter(v => v.price <= parseFloat(maxPrice));

    setFilteredVehicles(temp);
  };

  const resetFilters = () => {
    setBrand(''); setModel(''); setBodyType(''); setYear('');
    setCondition('All'); setTransmission('Any'); setMaxPrice('');
    setFilteredVehicles(vehicles);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Sales</Text>
      </View>

      <View style={styles.mainContainer}>
        {/* Sidebar Filters - Dual Pane Look on Web/Large Screens */}
        <ScrollView style={styles.filterSidebar} showsVerticalScrollIndicator={false}>
          <Text style={styles.sidebarTitle}>⏳ Filters</Text>
          
          <Text style={styles.label}>BRAND</Text>
          <TextInput style={styles.sidebarInput} placeholder="e.g. Honda" value={brand} onChangeText={setBrand} />
          
          <Text style={styles.label}>MODEL</Text>
          <TextInput style={styles.sidebarInput} placeholder="e.g. Civic" value={model} onChangeText={setModel} />

          <Text style={styles.label}>BODY TYPE</Text>
          <TextInput style={styles.sidebarInput} placeholder="e.g. SUV" value={bodyType} onChangeText={setBodyType} />

          <Text style={styles.label}>CONDITION</Text>
          <select style={styles.webSelect} value={condition} onChange={e => setCondition(e.target.value)}>
            <option value="All">All Conditions</option>
            <option value="Brand New">Brand New</option>
            <option value="Registered">Registered</option>
            <option value="Reconditioned">Reconditioned</option>
          </select>

          <Text style={styles.label}>TRANSMISSION</Text>
          <select style={styles.webSelect} value={transmission} onChange={e => setTransmission(e.target.value)}>
            <option value="Any">Any</option>
            <option value="Auto">Auto</option>
            <option value="Manual">Manual</option>
          </select>

          <Text style={styles.label}>MAX PRICE (RS.)</Text>
          <TextInput style={styles.sidebarInput} placeholder="e.g. 15M" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyBtnTxt}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetBtnTxt}>Reset</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Vehicles Grid */}
        <ScrollView style={styles.gridContainer} contentContainerStyle={styles.gridContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#c9a052" style={{ marginTop: 50 }} />
          ) : filteredVehicles.length === 0 ? (
            <Text style={styles.emptyTxt}>No vehicles found matching criteria.</Text>
          ) : (
            <View style={styles.grid}>
              {filteredVehicles.map((v) => (
                <View key={v._id} style={styles.card}>
                  <View style={styles.badge}><Text style={styles.badgeTxt}>★ {v.conditionStatus}</Text></View>
                  <Image source={{ uri: v.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.vTitle}>{v.brand} {v.name}</Text>
                    <Text style={styles.vPrice}>Rs. {(v.price / 1000000).toFixed(1)}M</Text>
                    
                    <View style={styles.specs}>
                      <Text style={styles.specItem}>📅 {v.yearReg || v.yom}</Text>
                      <Text style={styles.specItem}>🛣️ {v.mileage?.toLocaleString()} km</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.inquireBtn}>
                      <Text style={styles.inquireBtnTxt}>🛒 Purchase Interest</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#f0ebe0' },
  backBtn: { color: '#c9a052', fontWeight: 'bold' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginRight: 40 },
  
  mainContainer: { flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'column' },
  
  filterSidebar: { 
    width: Platform.OS === 'web' ? 300 : '100%', 
    backgroundColor: '#111318', 
    padding: 20,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#222'
  },
  sidebarTitle: { color: '#c9a052', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  sidebarInput: { backgroundColor: '#1e212a', color: '#fff', padding: 12, borderRadius: 8, fontSize: 12 },
  webSelect: { width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e212a', color: '#fff', border: 'none', fontSize: '12px' },
  actionRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  applyBtn: { flex: 2, backgroundColor: '#c9a052', padding: 12, borderRadius: 8, alignItems: 'center' },
  applyBtnTxt: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  resetBtn: { flex: 1, backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center' },
  resetBtnTxt: { color: '#fff', fontSize: 12 },

  gridContainer: { flex: 1 },
  gridContent: { padding: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  card: { backgroundColor: '#fff', width: Platform.OS === 'web' ? '48%' : '100%', borderRadius: 15, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  badge: { position: 'absolute', top: 10, left: 10, zIndex: 1, backgroundColor: 'rgba(201, 160, 82, 0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontSize: 9, fontWeight: 'bold', color: '#000' },
  cardImg: { width: '100%', height: 150, resizeMode: 'cover' },
  cardInfo: { padding: 15 },
  vTitle: { fontSize: 16, fontWeight: 'bold', color: '#111318' },
  vPrice: { fontSize: 14, color: '#c9a052', fontWeight: 'bold', marginVertical: 5 },
  specs: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  specItem: { fontSize: 11, color: '#666' },
  inquireBtn: { backgroundColor: '#111318', padding: 12, borderRadius: 8, alignItems: 'center' },
  inquireBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyTxt: { textAlign: 'center', marginTop: 50, color: '#888' }
});

export default BuyGalleryScreen;

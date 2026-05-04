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
import SearchBar from '../components/SearchBar';

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
  const [maxMileage, setMaxMileage] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (query) => {
    setSearchQuery(query);
    let temp = [...vehicles];
    if (query) {
      temp = temp.filter(v => 
        v.name?.toLowerCase().includes(query.toLowerCase()) || 
        v.brand?.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredVehicles(temp);
  };

  const applyFilters = () => {
    let temp = [...vehicles];

    if (searchQuery) {
      temp = temp.filter(v => 
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (brand) temp = temp.filter(v => v.brand?.toLowerCase().includes(brand.toLowerCase()));
    if (model) temp = temp.filter(v => v.name?.toLowerCase().includes(model.toLowerCase()));
    if (bodyType) temp = temp.filter(v => v.bodyType?.toLowerCase().includes(bodyType.toLowerCase()));
    if (year) temp = temp.filter(v => v.yearReg === parseInt(year) || v.yom === parseInt(year));
    if (condition !== 'All') temp = temp.filter(v => v.conditionStatus === condition);
    if (transmission !== 'Any') temp = temp.filter(v => v.transmission === transmission);
    if (maxMileage) temp = temp.filter(v => v.mileage <= parseFloat(maxMileage));
    if (maxPrice) temp = temp.filter(v => v.price <= parseFloat(maxPrice));

    setFilteredVehicles(temp);
    setShowFilters(false); // Hide filters after applying
  };

  const resetFilters = () => {
    setBrand(''); setModel(''); setBodyType(''); setYear('');
    setCondition('All'); setTransmission('Any'); setMaxMileage(''); setMaxPrice('');
    setSearchQuery('');
    setFilteredVehicles(vehicles);
    setShowFilters(false);
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

      {/* Global Reusable Search Bar */}
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onFilterPress={() => setShowFilters(!showFilters)}
        isFilterVisible={showFilters}
      />

      <View style={styles.mainContainer}>
        {/* Toggleable Filters Panel */}
        {showFilters && (
          <View style={styles.filterSidebar}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              <View style={styles.filterCard}>
                <View style={styles.filterHeader}>
                  <Text style={{ fontSize: 24, marginRight: 10 }}>⏳</Text>
                  <Text style={styles.filterTitle}>Advanced Filters</Text>
                </View>

                {/* Row 1: Brand & Model */}
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>BRAND</Text>
                    <TextInput style={styles.sidebarInput} placeholder="e.g. Honda" placeholderTextColor="#555" value={brand} onChangeText={setBrand} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>MODEL</Text>
                    <TextInput style={styles.sidebarInput} placeholder="e.g. Civic" placeholderTextColor="#555" value={model} onChangeText={setModel} />
                  </View>
                </View>

                {/* Row 2: Body Type & Reg Year */}
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>BODY TYPE</Text>
                    <TextInput style={styles.sidebarInput} placeholder="e.g. Sedan" placeholderTextColor="#555" value={bodyType} onChangeText={setBodyType} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>REG YEAR</Text>
                    <TextInput style={styles.sidebarInput} placeholder="Year" placeholderTextColor="#555" keyboardType="numeric" value={year} onChangeText={setYear} />
                  </View>
                </View>

                {/* Condition Select */}
                <Text style={styles.label}>CONDITION</Text>
                <select style={styles.webSelect} value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="All">All Conditions</option>
                  <option value="Brand New">Brand New</option>
                  <option value="Registered">Registered</option>
                  <option value="Reconditioned">Reconditioned</option>
                </select>

                {/* Row 3: Transmission & Mileage */}
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>TRANSMISSION</Text>
                    <select style={styles.webSelect} value={transmission} onChange={e => setTransmission(e.target.value)}>
                      <option value="Any">Any</option>
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                      <option value="Tiptronic">Tiptronic</option>
                    </select>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>MAX MILEAGE</Text>
                    <TextInput style={styles.sidebarInput} placeholder="km" placeholderTextColor="#555" keyboardType="numeric" value={maxMileage} onChangeText={setMaxMileage} />
                  </View>
                </View>

                {/* Max Price */}
                <Text style={styles.label}>MAX PRICE (RS.)</Text>
                <TextInput style={styles.sidebarInput} placeholder="e.g. 15000000" placeholderTextColor="#555" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                    <Text style={styles.resetBtnTxt}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                    <Text style={styles.applyBtnTxt}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}

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
                    
                    <TouchableOpacity 
                      style={styles.inquireBtn}
                      onPress={() => navigation.navigate('SaleVehicleDetails', { vehicle: v })}
                    >
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

  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#f0ebe0',
    gap: 12,
    alignItems: 'center'
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  filterToggleBtn: {
    width: 55,
    height: 55,
    backgroundColor: '#111318',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  
  filterSidebar: { 
    width: Platform.OS === 'web' ? 380 : '100%', 
    backgroundColor: '#f0ebe0', 
    padding: 15,
    position: Platform.OS === 'web' ? 'relative' : 'absolute',
    top: 0,
    zIndex: 100,
  },
  filterCard: {
    backgroundColor: '#111318',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  filterTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  
  row: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  col: { flex: 1 },
  label: { color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  sidebarInput: { 
    backgroundColor: '#1e212a', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2a2d37'
  },
  webSelect: { 
    width: '100%', 
    padding: '15px', 
    borderRadius: '12px', 
    backgroundColor: '#1e212a', 
    color: '#fff', 
    border: '1px solid #2a2d37', 
    fontSize: '14px',
    marginBottom: 15
  },
  
  actionRow: { flexDirection: 'row', marginTop: 25, gap: 15, alignItems: 'center' },
  applyBtn: { 
    flex: 2, 
    backgroundColor: '#c9a052', 
    paddingVertical: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    shadowColor: '#c9a052',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  applyBtnTxt: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  resetBtn: { 
    flex: 1, 
    paddingVertical: 18, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 15
  },
  resetBtnTxt: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

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

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { showAlert } from '../../services/alertHelper';
import VehicleCard from '../components/VehicleCard';
import CustomHeader from '../components/CustomHeader';
import SearchBar from '../components/SearchBar';
import CustomPicker from '../components/CustomPicker';

const RentGalleryScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    name: '',
    type: 'All',
    gearType: 'Any',
    fuelType: 'Any',
    seats: 'Any',
    maxPrice: '',
  });

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles/rent');
      setVehicles(response.data);
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error('Fetch rent vehicles error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const applyFilters = (query = searchQuery, activeFilters = filters) => {
    // Validation for negative values
    if (activeFilters.maxPrice && parseFloat(activeFilters.maxPrice) < 0) {
      showAlert('Invalid Price', 'Max price cannot be negative.');
      return;
    }

    let temp = [...vehicles];

    // Global Search
    if (query) {
      temp = temp.filter(v => 
        v.name?.toLowerCase().includes(query.toLowerCase()) || 
        v.type?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Advanced Filters
    if (activeFilters.name) temp = temp.filter(v => v.name?.toLowerCase().includes(activeFilters.name.toLowerCase()));
    if (activeFilters.type !== 'All') temp = temp.filter(v => v.type === activeFilters.type);
    if (activeFilters.gearType !== 'Any') temp = temp.filter(v => v.gearType === activeFilters.gearType);
    if (activeFilters.fuelType !== 'Any') temp = temp.filter(v => v.fuelType === activeFilters.fuelType);
    if (activeFilters.seats !== 'Any') temp = temp.filter(v => v.seats === parseInt(activeFilters.seats));
    if (activeFilters.maxPrice) temp = temp.filter(v => v.dailyRate <= parseFloat(activeFilters.maxPrice));

    setFilteredVehicles(temp);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const defaultFilters = { name: '', type: 'All', gearType: 'Any', fuelType: 'Any', seats: 'Any', maxPrice: '' };
    setFilters(defaultFilters);
    setSearchQuery('');
    setFilteredVehicles(vehicles);
    setShowFilters(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <CustomHeader 
        title="Premium Fleet"
        subtitle={`Rent the luxury you deserve • ${filteredVehicles.length} cars`}
        onBack={() => navigation.goBack()}
      />

      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onFilterPress={() => setShowFilters(!showFilters)}
        isFilterVisible={showFilters}
      />

      <View style={styles.mainContainer}>
        {showFilters && (
          <View style={styles.filterSidebar}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterCard}>
                <View style={styles.filterHeader}>
                  <Text style={{ fontSize: 24, marginRight: 10 }}>⚙️</Text>
                  <Text style={styles.filterTitle}>Filter Vehicles</Text>
                </View>

                <Text style={styles.label}>SEARCH BY NAME</Text>
                <TextInput 
                  style={styles.sidebarInput} 
                  placeholder="e.g. Toyota Premio" 
                  placeholderTextColor="#555" 
                  value={filters.name} 
                  onChangeText={t => setFilters({...filters, name: t})} 
                />

                <CustomPicker 
                  label="VEHICLE TYPE"
                  value={filters.type}
                  onValueChange={v => setFilters({...filters, type: v})}
                  options={[
                    { label: 'All Types', value: 'All' },
                    { label: 'Sedan', value: 'Sedan' },
                    { label: 'SUV', value: 'SUV' },
                    { label: 'Hatchback', value: 'Hatchback' },
                    { label: 'Van', value: 'Van' },
                  ]}
                />

                <View style={styles.row}>
                  <View style={styles.col}>
                    <CustomPicker 
                      label="TRANSMISSION"
                      value={filters.gearType}
                      onValueChange={v => setFilters({...filters, gearType: v})}
                      options={[
                        { label: 'Any', value: 'Any' },
                        { label: 'Auto', value: 'Auto' },
                        { label: 'Manual', value: 'Manual' },
                      ]}
                    />
                  </View>
                  <View style={[styles.col, { marginLeft: 10 }]}>
                    <CustomPicker 
                      label="FUEL TYPE"
                      value={filters.fuelType}
                      onValueChange={v => setFilters({...filters, fuelType: v})}
                      options={[
                        { label: 'Any', value: 'Any' },
                        { label: 'Petrol', value: 'Petrol' },
                        { label: 'Diesel', value: 'Diesel' },
                        { label: 'Hybrid', value: 'Hybrid' },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    <CustomPicker 
                      label="SEATS"
                      value={filters.seats}
                      onValueChange={v => setFilters({...filters, seats: v})}
                      options={[
                        { label: 'Any', value: 'Any' },
                        { label: '2 Seats', value: '2' },
                        { label: '4 Seats', value: '4' },
                        { label: '5 Seats', value: '5' },
                        { label: '7 Seats', value: '7' },
                        { label: '9+ Seats', value: '9' },
                      ]}
                    />
                  </View>
                  <View style={[styles.col, { marginLeft: 10 }]}>
                    <Text style={styles.label}>MAX PRICE (RS)</Text>
                    <TextInput 
                      style={styles.sidebarInput} 
                      placeholder="e.g. 5000" 
                      placeholderTextColor="#555" 
                      keyboardType="numeric"
                      value={filters.maxPrice} 
                      onChangeText={t => setFilters({...filters, maxPrice: t})} 
                    />
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                    <Text style={styles.resetBtnTxt}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyBtn} onPress={() => applyFilters()}>
                    <Text style={styles.applyBtnTxt}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.loadingArea}><ActivityIndicator size="large" color="#c9a052" /></View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#c9a052']} />}
          >
            <View style={styles.grid}>
              {filteredVehicles.map((v) => (
                <VehicleCard 
                  key={v._id} 
                  vehicle={v} 
                  type="rent" 
                  onPress={() => navigation.navigate('RentBooking', { vehicle: v })}
                />
              ))}
            </View>
            {filteredVehicles.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTxt}>No vehicles found matching your criteria.</Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  mainContainer: { flex: 1 },
  loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
  grid: { marginTop: 10 },
  emptyState: { padding: 50, alignItems: 'center' },
  emptyTxt: { color: '#888', fontSize: 14, textAlign: 'center' },
  
  filterSidebar: { 
    width: '100%', 
    padding: 15,
    position: 'absolute',
    top: 0,
    zIndex: 100,
  },
  filterCard: {
    backgroundColor: '#111318',
    borderRadius: 25,
    padding: 25,
    elevation: 10,
  },
  filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  filterTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  
  row: { flexDirection: 'row', marginBottom: 15 },
  col: { flex: 1 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  sidebarInput: { 
    backgroundColor: '#1e212a', 
    color: '#fff', 
    padding: 12, 
    borderRadius: 12, 
    fontSize: 14,
    marginBottom: 15
  },
  webSelect: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '12px', 
    backgroundColor: '#1e212a', 
    color: '#fff', 
    border: 'none', 
    fontSize: '14px' 
  },
  
  actionRow: { flexDirection: 'row', marginTop: 20 },
  applyBtn: { flex: 2, backgroundColor: '#c9a052', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  applyBtnTxt: { color: '#000', fontWeight: 'bold' },
  resetBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333', borderRadius: 12 },
  resetBtnTxt: { color: '#fff' },
});

export default RentGalleryScreen;

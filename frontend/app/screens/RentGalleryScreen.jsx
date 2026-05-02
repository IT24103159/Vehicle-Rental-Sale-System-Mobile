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
import VehicleCard from '../components/VehicleCard';
import CustomHeader from '../components/CustomHeader';

const RentGalleryScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  
  const [filters, setFilters] = useState({
    type: '',
    gearType: '',
    fuelType: '',
    maxPrice: '',
  });

  // This hook runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  const fetchVehicles = async (activeFilters = filters) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (activeFilters.type) query.append('type', activeFilters.type);
      if (activeFilters.gearType) query.append('gearType', activeFilters.gearType);
      if (activeFilters.fuelType) query.append('fuelType', activeFilters.fuelType);
      if (activeFilters.maxPrice) query.append('maxPrice', activeFilters.maxPrice);

      const response = await api.get(`/vehicles/rent?${query.toString()}`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Fetch rent vehicles error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const filterBtn = (
    <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.filterBtn}>
      <Text style={styles.filterBtnTxt}>⏳ FILTERS</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <CustomHeader 
        title="Premium Fleet"
        subtitle={`Rent the luxury you deserve • ${vehicles.length} cars`}
        onBack={() => navigation.goBack()}
        rightElement={filterBtn}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingArea}><ActivityIndicator size="large" color="#c9a052" /></View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#c9a052']} />}
        >
          <View style={styles.grid}>
            {vehicles.map((v) => (
              <VehicleCard 
                key={v._id} 
                vehicle={v} 
                type="rent" 
                onPress={() => navigation.navigate('RentBooking', { vehicle: v })}
              />
            ))}
          </View>
          {vehicles.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTxt}>No vehicles found matching your criteria.</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Filter Modal logic */}
      <Modal visible={filterVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⏳ Filter Rent Fleet</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <View style={styles.filterForm}>
              <Text style={styles.label}>VEHICLE TYPE</Text>
              <TextInput style={styles.input} placeholder="e.g. Sedan, SUV" value={filters.type} onChangeText={t => setFilters({...filters, type: t})} />
              <TouchableOpacity style={styles.applyBtn} onPress={() => { setFilterVisible(false); fetchVehicles(); }}>
                <Text style={styles.applyBtnTxt}>APPLY FILTERS</Text>
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
  loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 16 },
  grid: { gap: 10 },
  filterBtn: { backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  filterBtnTxt: { fontSize: 10, fontWeight: 'bold', color: '#111318' },
  emptyState: { padding: 50, alignItems: 'center' },
  emptyTxt: { color: '#888', fontSize: 14, textAlign: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { fontSize: 20, color: '#888' },
  filterForm: { gap: 15 },
  label: { fontSize: 10, fontWeight: 'bold' },
  input: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  applyBtn: { backgroundColor: '#111318', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyBtnTxt: { color: '#fff', fontWeight: 'bold' },
});

export default RentGalleryScreen;

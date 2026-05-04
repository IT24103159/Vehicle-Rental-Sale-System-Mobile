import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const FleetManagementScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('rent'); // 'rent' or 'sale'
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [activeTab])
  );

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'rent' ? '/vehicles/rent' : '/vehicles/sale';
      const response = await api.get(endpoint);
      setVehicles(response.data);
    } catch (error) {
      console.error('Fetch vehicles error:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    const confirmDelete = async () => {
      try {
        const endpoint = activeTab === 'rent' ? `/vehicles/rent/${id}` : `/vehicles/sale/${id}`;
        // Since we don't have a delete route implemented in backend yet, we assume it exists
        // If it doesn't, you'll need to create it in vehicleRoutes.js
        await api.delete(endpoint);
        fetchVehicles();
        Alert.alert('Success', 'Vehicle deleted successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to delete vehicle. Endpoint might be missing in backend.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete ${name}?`)) confirmDelete();
    } else {
      Alert.alert('Confirm Delete', `Permanently delete ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnTxt}>← </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Vehicle Management</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <Text style={styles.addBtnTxt}>+ Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rent' && styles.activeTab]}
            onPress={() => setActiveTab('rent')}
          >
            <Text style={[styles.tabTxt, activeTab === 'rent' && styles.activeTabTxt]}>Rent Vehicles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sale' && styles.activeTab]}
            onPress={() => setActiveTab('sale')}
          >
            <Text style={[styles.tabTxt, activeTab === 'sale' && styles.activeTabTxt]}>Sale Vehicles</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#c9a052" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 250 }]}>VEHICLE</Text>
                <Text style={[styles.th, { width: 180 }]}>SPECS</Text>
                <Text style={[styles.th, { width: 160 }]}>CONDITIONS</Text>
                <Text style={[styles.th, { width: 120 }]}>STATUS</Text>
                <Text style={[styles.th, { width: 120 }]}>{activeTab === 'rent' ? 'RATE (RS.)' : 'PRICE (RS.)'}</Text>
                <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>ACTIONS</Text>
              </View>

              {/* Table Body */}
              {vehicles.map((v) => (
                <View key={v._id} style={styles.tableRow}>
                  {/* Vehicle Column */}
                  <View style={[styles.td, { width: 250, flexDirection: 'row', alignItems: 'center' }]}>
                    {v.images && v.images.length > 0 ? (
                      <Image source={{ uri: v.images[0] }} style={styles.vImage} />
                    ) : (
                      <View style={styles.vImagePlaceholder}><Text style={{ fontSize: 10 }}>No Img</Text></View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vName} numberOfLines={1}>{v.name}</Text>
                      <Text style={styles.vSub}>{activeTab === 'rent' ? `${v.year} • ${v.type}` : `${v.yom} • ${v.brand}`}</Text>
                    </View>
                  </View>

                  {/* Specs Column */}
                  <View style={[styles.td, { width: 180, justifyContent: 'center' }]}>
                    <Text style={styles.specTxt}>⛽ {v.fuelType} ({activeTab === 'rent' ? v.avgFuelEfficiency : v.engineCap})</Text>
                    <Text style={styles.specTxt}>⚙️ {activeTab === 'rent' ? v.gearType : v.transmission} • 🪑 {activeTab === 'rent' ? `${v.seats} Seats` : v.color}</Text>
                  </View>

                  {/* Conditions Column */}
                  <View style={[styles.td, { width: 160, justifyContent: 'center' }]}>
                    {activeTab === 'rent' ? (
                      <>
                        <Text style={styles.condTxt}>Limit: {v.mileageLimit} km</Text>
                        <Text style={styles.condSub}>Extra: Rs. {v.extraMileageCharge}/km</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.condTxt}>{v.conditionStatus}</Text>
                        <Text style={styles.condSub}>Mileage: {v.mileage} km</Text>
                      </>
                    )}
                  </View>

                  {/* Status Column */}
                  <View style={[styles.td, { width: 120, justifyContent: 'center' }]}>
                    <View style={[
                      styles.statusPill,
                      v.status === 'Available' ? styles.statusGreen :
                        v.status === 'Pending' ? styles.statusOrange : styles.statusRed
                    ]}>
                      <Text style={[
                        styles.statusTxt,
                        v.status === 'Available' ? styles.statusGreenTxt :
                          v.status === 'Pending' ? styles.statusOrangeTxt : styles.statusRedTxt
                      ]}>• {v.status?.toUpperCase() || 'AVAILABLE'}</Text>
                    </View>
                  </View>

                  {/* Rate/Price Column */}
                  <View style={[styles.td, { width: 120, justifyContent: 'center' }]}>
                    <Text style={styles.priceTxt}>Rs. {activeTab === 'rent' ? v.dailyRate : v.price}</Text>
                  </View>

                  {/* Actions Column */}
                  <View style={[styles.td, { width: 120, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]}>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => navigation.navigate('AddVehicle', { vehicle: v, type: activeTab })}
                    >
                      <Text style={{ fontSize: 12 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { borderColor: '#ffcdd2' }]} onPress={() => handleDelete(v._id, v.name)}>
                      <Text style={{ fontSize: 12 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {vehicles.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTxt}>No {activeTab} vehicles found.</Text>
                </View>
              )}

            </View>
          </ScrollView>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9f9f9' },
  loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingHorizontal: 20, paddingTop: 15, backgroundColor: '#f0ebe0', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTop: { marginBottom: 10 },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold' },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f1117' },
  addBtn: { backgroundColor: '#111318', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnTxt: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  tabContainer: { flexDirection: 'row', gap: 10, paddingBottom: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  activeTab: { backgroundColor: '#c9a052', borderColor: '#c9a052' },
  tabTxt: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  activeTabTxt: { color: '#fff' },

  table: { backgroundColor: '#ffffff', margin: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0', minWidth: 950 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 14 },
  th: { fontSize: 10, fontWeight: 'bold', color: '#888', paddingHorizontal: 15, textTransform: 'uppercase', letterSpacing: 0.5 },

  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f4f4f4', paddingVertical: 15 },
  td: { paddingHorizontal: 15 },

  vImage: { width: 50, height: 35, borderRadius: 4, marginRight: 15, resizeMode: 'cover' },
  vImagePlaceholder: { width: 50, height: 35, borderRadius: 4, marginRight: 15, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  vName: { fontSize: 13, fontWeight: 'bold', color: '#111318' },
  vSub: { fontSize: 11, color: '#888', marginTop: 2 },

  specTxt: { fontSize: 11, color: '#555', marginBottom: 2 },

  condTxt: { fontSize: 11, fontWeight: '600', color: '#333' },
  condSub: { fontSize: 10, color: '#888', marginTop: 2 },

  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusGreen: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9' },
  statusOrange: { backgroundColor: '#fff3e0', borderWidth: 1, borderColor: '#ffe0b2' },
  statusRed: { backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ffcdd2' },
  statusGreenTxt: { fontSize: 9, fontWeight: 'bold', color: '#2e7d32' },
  statusOrangeTxt: { fontSize: 9, fontWeight: 'bold', color: '#e65100' },
  statusRedTxt: { fontSize: 9, fontWeight: 'bold', color: '#c62828' },

  priceTxt: { fontSize: 13, fontWeight: 'bold', color: '#c9a052' },

  actionBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyTxt: { color: '#888', fontSize: 13 },
});

export default FleetManagementScreen;

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const VehicleCard = ({ vehicle, type, onPress }) => {
  const isRent = type === 'rent';
  const mainPrice = isRent ? vehicle.dailyRate : vehicle.price;
  const secondaryInfo = isRent ? '/ day' : '';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageContainer}>
        {vehicle.images && vehicle.images.length > 0 ? (
          <Image source={{ uri: vehicle.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImg}><Text>🚗</Text></View>
        )}
        <View style={[styles.badge, isRent ? styles.badgeRent : styles.badgeSale]}>
          <Text style={styles.badgeTxt}>
            {isRent ? vehicle.type : vehicle.conditionStatus}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {!isRent && <Text style={styles.brandTxt}>{vehicle.brand} • {vehicle.yom}</Text>}
        <Text style={styles.name}>{vehicle.name} {isRent && <Text style={styles.year}>({vehicle.year})</Text>}</Text>
        <Text style={styles.price}>LKR {mainPrice?.toLocaleString()} <Text style={styles.priceSub}>{secondaryInfo}</Text></Text>
        
        <View style={styles.specsRow}>
          {isRent ? (
            <>
              <Text style={styles.specItem}>⛽ {vehicle.fuelType}</Text>
              <Text style={styles.specItem}>⚙️ {vehicle.gearType}</Text>
              <Text style={styles.specItem}>💺 {vehicle.seats} Seats</Text>
            </>
          ) : (
            <>
              <Text style={styles.specItem}>⚙️ {vehicle.transmission}</Text>
              <Text style={styles.specItem}>🛣️ {vehicle.mileage?.toLocaleString()} km</Text>
              <Text style={styles.specItem}>🎨 {vehicle.color}</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={[styles.actionBtn, isRent ? styles.actionBtnRent : styles.actionBtnSale]} onPress={onPress}>
          <Text style={[styles.actionBtnTxt, !isRent && { color: '#111318' }]}>
            {isRent ? 'Book Now' : 'View Details'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: { height: 200, backgroundColor: '#f8f9fa' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeRent: { backgroundColor: '#c9a052' },
  badgeSale: { backgroundColor: '#111318' },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  content: { padding: 16 },
  brandTxt: { fontSize: 11, fontWeight: 'bold', color: '#c9a052', textTransform: 'uppercase', marginBottom: 4 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#111318', marginBottom: 4 },
  year: { color: '#6c757d', fontWeight: 'normal', fontSize: 14 },
  price: { fontSize: 17, fontWeight: 'bold', color: '#111318', marginBottom: 12 },
  priceSub: { fontSize: 12, color: '#8a94a8', fontWeight: 'normal' },

  specsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  specItem: { fontSize: 12, color: '#5a5e6b' },

  actionBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnRent: { backgroundColor: '#111318' },
  actionBtnSale: { borderWidth: 1.5, borderColor: '#111318' },
  actionBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default VehicleCard;

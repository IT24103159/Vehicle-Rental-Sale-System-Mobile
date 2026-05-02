import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const CustomerDashboard = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { title: 'Update Profile', icon: '👤', desc: 'Edit your personal details & password', screen: 'UpdateProfile' },
    { title: 'Rent a Vehicle', icon: '🚗', desc: 'Browse our premium fleet for rent', screen: 'RentGallery' },
    { title: 'Buy a Vehicle', icon: '🚘', desc: 'Find your dream car to purchase', screen: 'BuyGallery' },
    { title: 'Rental History & Reviews', icon: '⭐', desc: 'Rate your past rides', screen: 'RentalHistory' },
    { title: 'Payment History', icon: '🧾', desc: 'View your bookings and payments', screen: 'PaymentHistory' },
    { title: 'Notifications', icon: '🔔', desc: 'View alerts & special offers', screen: 'CustomerNotifications' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>SAMARASINGHE <Text style={styles.brandGold}>MOTORS</Text></Text>
            <Text style={styles.headerSub}>Customer Dashboard</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutPill}>
            <Text style={styles.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeAvatar}>
            <Text style={styles.welcomeAvatarTxt}>{user?.fullName?.[0] || 'U'}</Text>
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeName}>Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</Text>
            <Text style={styles.welcomeEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeTxt}>CUSTOMER</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.menuCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuIcon}>
                  <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{user?.fullName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user?.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{user?.phone || 'Not set'}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Account Status</Text>
              <View style={styles.statusActive}>
                <Text style={styles.statusActiveTxt}>• ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
  },
  brandName: { fontSize: 20, fontWeight: '900', color: '#111318', letterSpacing: -0.5 },
  brandGold: { color: '#c9a052' },
  headerSub: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  logoutPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutTxt: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },

  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 25,
  },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c9a052',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  welcomeAvatarTxt: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  welcomeInfo: { flex: 1 },
  welcomeName: { fontSize: 18, fontWeight: 'bold', color: '#111318' },
  welcomeEmail: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  roleBadge: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleBadgeTxt: { fontSize: 10, fontWeight: 'bold', color: '#7b1fa2' },

  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111318', marginBottom: 15 },

  menuGrid: { gap: 12 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuIcon: {
    width: 54,
    height: 54,
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#111318', marginBottom: 2 },
  menuDesc: { fontSize: 12, color: '#6c757d' },
  menuArrow: { fontSize: 20, color: '#c9a052', fontWeight: 'bold' },

  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: { fontSize: 13, color: '#6c757d' },
  detailValue: { fontSize: 13, fontWeight: 'bold', color: '#111318' },
  statusActive: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActiveTxt: { fontSize: 11, fontWeight: 'bold', color: '#2e7d32' },
});

export default CustomerDashboard;

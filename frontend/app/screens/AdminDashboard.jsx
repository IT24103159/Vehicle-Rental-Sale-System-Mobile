import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

import CustomHeader from '../components/CustomHeader';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const adminActions = [
    { title: 'Manage Users', icon: '👤', desc: 'View, edit and block users', screen: 'UserManagement' },
    { title: 'Add Vehicle', icon: '➕', desc: 'Add new rental or sale vehicle', screen: 'AddVehicle' },
    { title: 'Vehicle Fleet', icon: '🚘', desc: 'Manage your current fleet', screen: 'Fleet' },
    { title: 'Bookings', icon: '📋', desc: 'Review and approve bookings', screen: 'AdminBookings' },
    { title: 'Payments', icon: '💳', desc: 'Approve bank slip payments', screen: 'AdminPayments' },
    { title: 'Promotions', icon: '🎁', desc: 'Create & manage discount codes', screen: 'AdminPromotions' },
    { title: 'Inquiries', icon: '✉️', desc: 'Reply to customer inquiries', screen: 'AdminInquiries' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <CustomHeader title={`Management Console`} showBack={false} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Admin Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsGrid}>
            {adminActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => a.screen && navigation.navigate(a.screen)}
              >
                <View style={styles.actionIcon}>
                  <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>{a.title}</Text>
                  <Text style={styles.actionDesc}>{a.desc}</Text>
                </View>

              </TouchableOpacity>
            ))}
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
    paddingBottom: 25,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0f1117' },
  headerSubtitle: { fontSize: 14, color: '#6c757d', marginTop: 4 },
  logoutPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutTxt: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },

  /* Metrics */
  metricsContainer: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricTitle: { fontSize: 11, fontWeight: 'bold', color: '#6c757d', textTransform: 'uppercase' },
  metricValue: { fontSize: 28, fontWeight: 'bold', color: '#0f1117', marginBottom: 4 },
  metricTrend: { fontSize: 12, fontWeight: '600' },

  /* Actions */
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f1117', marginBottom: 16 },
  actionsGrid: { gap: 12 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionIcon: {
    width: 54,
    height: 54,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f1117', marginBottom: 2 },
  actionDesc: { fontSize: 12, color: '#6c757d' },
  chevron: { fontSize: 20, color: '#c9a052', fontWeight: 'bold' },

  /* Logs */
  activityLogs: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logDetails: { flex: 1 },
  logTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f1117' },
  logSub: { fontSize: 12, color: '#6c757d' },
  logTime: { fontSize: 12, color: '#c9a052', fontWeight: 'bold' },
});

export default AdminDashboard;

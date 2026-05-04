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
  Platform,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2;

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);



  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.helloTxt}>Hello,</Text>
            <Text style={styles.userNameTxt}>{user?.fullName?.split(' ')[0] || 'Guest'} 👋</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeTxt}>{user?.role || 'User'}</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>PREMIUM VEHICLE RENTALS & SALES</Text>
          <Text style={styles.heroTitle}>
            Samarasinghe <Text style={styles.goldText}>Motors</Text>
          </Text>
          <Text style={styles.heroSub}>
            Welcome to the premium portal. Experience excellence in every ride and transaction with our curated collection.
          </Text>

          <View style={styles.heroBtns}>
            <TouchableOpacity
              style={[styles.btnPrimary, { marginBottom: 12 }]}
              onPress={() => navigation.navigate('RentGallery')}
            >
              <Text style={styles.btnPrimaryText}>Browse Rentals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('BuyGallery')}
            >
              <Text style={styles.btnOutlineText}>View Sales Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>





        <View style={{ height: 60 }} />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  container: { flex: 1 },
  goldText: { color: '#c9a052' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  helloTxt: { fontSize: 14, color: '#5a5e6b' },
  userNameTxt: { fontSize: 20, fontWeight: 'bold', color: '#111318' },
  headerBadge: { backgroundColor: 'rgba(201, 160, 82, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(201, 160, 82, 0.2)' },
  headerBadgeTxt: { fontSize: 10, fontWeight: 'bold', color: '#c9a052', textTransform: 'uppercase' },

  heroSection: {
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#c9a052',
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 82, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#111318',
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 14,
    color: '#5a5e6b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  heroBtns: {
    flexDirection: 'column',
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: '#111318',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 10px 20px rgba(0,0,0,0.15)' },
      default: { elevation: 4 }
    })
  },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#c9a052',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  btnOutlineText: { color: '#111318', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#111318',
    paddingVertical: 30,
    marginHorizontal: 24,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#c9a052', marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#8f94a5', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

  section: { paddingHorizontal: 24, marginTop: 50 },
  sectionHeader: { alignItems: 'center', marginBottom: 30 },
  sectionEyebrow: { fontSize: 10, fontWeight: '700', color: '#c9a052', letterSpacing: 2, marginBottom: 8 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#111318', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  svcCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
    ...Platform.select({
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' }
    })
  },
  svcIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  svcIconText: { fontSize: 24 },
  svcTitle: { fontSize: 16, fontWeight: 'bold', color: '#111318', marginBottom: 8 },
  svcDesc: { fontSize: 12, color: '#6c757d', lineHeight: 18, marginBottom: 15 },
  svcCta: { fontSize: 12, fontWeight: 'bold', color: '#c9a052' },

  trustSection: {
    backgroundColor: '#111318',
    marginHorizontal: 24,
    marginTop: 40,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 10,
  },
  trustEyebrow: { fontSize: 10, fontWeight: '700', color: '#c9a052', letterSpacing: 2, marginBottom: 12 },
  trustTitle: { fontSize: 20, fontWeight: 'bold', color: '#f0ebe0', textAlign: 'center', marginBottom: 25 },
  trustBadges: { flexDirection: 'row', justifyContent: 'space-between' },
  trustBadge: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  trustBadgeIcon: { fontSize: 22, marginBottom: 8 },
  trustBadgeTxt: { fontSize: 9, color: '#c9a052', fontWeight: 'bold', letterSpacing: 1 },
});

export default HomeScreen;

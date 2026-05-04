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
  const { user, logout } = useContext(AuthContext);


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

        <View style={styles.header}>
          <View>
            <Text style={styles.helloTxt}>Hello,</Text>
            <Text style={styles.userNameTxt}>{user?.fullName?.split(' ')[0] || 'Guest'} 👋</Text>
          </View>

        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>PREMIUM VEHICLE RENTALS & SALES</Text>
          <Text style={styles.heroTitle}>
            Samarasinghe <Text style={styles.goldText}>Motors</Text>
          </Text>
          <Text style={styles.heroSub}>
            Welcome to the premium portal. Manage your rentals and access tools seamlessly.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.mainBtn}
              onPress={() => navigation.navigate('RentGallery')}
            >
              <Text style={styles.mainBtnText}>Rent a Vehicle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secBtn}
              onPress={() => navigation.navigate('BuyGallery')}
            >
              <Text style={styles.secBtnText}>Buy a Vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>



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
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#161b27',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.2)' }
    })
  },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#c0b8a8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnOutlineText: { color: '#161b27', fontWeight: 'bold', fontSize: 15 },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#111318',
    paddingVertical: 25,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.07)',
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#c9a052', marginBottom: 4 },
  statLabel: { fontSize: 9, color: '#8f94a5', fontWeight: '600', textTransform: 'uppercase' },

  section: { paddingHorizontal: 20, marginTop: 40 },
  sectionHeader: { alignItems: 'center', marginBottom: 30 },
  sectionEyebrow: { fontSize: 10, fontWeight: '700', color: '#c9a052', letterSpacing: 2, marginBottom: 8 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#111318', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  svcCard: {
    width: CARD_WIDTH,
    backgroundColor: '#161b27',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#c9a052',
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }
    })
  },
  svcIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(201, 160, 82, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  svcIconText: { fontSize: 22 },
  svcTitle: { fontSize: 15, fontWeight: 'bold', color: '#f0ebe0', marginBottom: 8 },
  svcDesc: { fontSize: 12, color: '#8f94a5', lineHeight: 18, marginBottom: 12 },
  svcCta: { fontSize: 12, fontWeight: 'bold', color: '#c9a052' },

  trustSection: {
    backgroundColor: '#111318',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
  },
  trustEyebrow: { fontSize: 10, fontWeight: '700', color: '#c9a052', letterSpacing: 2, marginBottom: 10 },
  trustTitle: { fontSize: 18, fontWeight: 'bold', color: '#f0ebe0', textAlign: 'center', marginBottom: 25 },
  trustBadges: { flexDirection: 'row', gap: 10 },
  trustBadge: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  trustBadgeIcon: { fontSize: 20, marginBottom: 5 },
  trustBadgeTxt: { fontSize: 9, color: '#c9a052', fontWeight: '600' },


});

export default HomeScreen;

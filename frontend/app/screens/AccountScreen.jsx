import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomHeader from '../components/CustomHeader';

const AccountScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <CustomHeader title="My Account" showBack={false} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeAvatar}>
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.welcomeAvatarTxt}>{user?.fullName?.[0] || 'U'}</Text>
            )}
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeName}>Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</Text>
            <Text style={styles.welcomeEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeTxt}>{user?.role?.toUpperCase() || 'USER'}</Text>
            </View>
          </View>
        </View>



        {/* Account Menu */}
        <View style={styles.menuSection}>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('UpdateProfile')}
          >

            <Text style={styles.menuText}>Account Settings</Text>
            <Text style={styles.menuArrow}></Text>


          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}

          >

            <Text style={styles.menuText}>About Us</Text>
            <Text style={styles.menuArrow}></Text>


          </TouchableOpacity>


        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnTxt}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionTxt}>App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  content: { padding: 20 },

  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 30,
    elevation: 2,
  },
  welcomeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#c9a052',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  welcomeAvatarTxt: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  avatarImg: { width: 60, height: 60, borderRadius: 30 },
  welcomeInfo: { flex: 1 },
  welcomeName: { fontSize: 18, fontWeight: 'bold', color: '#111318' },
  welcomeEmail: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  roleBadge: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleBadgeTxt: { fontSize: 11, fontWeight: 'bold', color: '#7b1fa2' },

  menuSection: { backgroundColor: '#fff', borderRadius: 16, padding: 10, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111318', marginBottom: 15 },

  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 25,
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
  detailValue: { fontSize: 13, fontWeight: 'bold', color: '#111318', flex: 1, textAlign: 'right', marginLeft: 10 },
  statusActive: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActiveTxt: { fontSize: 11, fontWeight: 'bold', color: '#2e7d32' },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: { fontSize: 18, marginRight: 15 },
  menuText: { flex: 1, fontSize: 15, color: '#333' },
  menuArrow: { fontSize: 18, color: '#c9a052' },

  logoutBtn: {
    backgroundColor: '#ffebee',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  logoutBtnTxt: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 },
  versionTxt: { textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 20 },
});

export default AccountScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import api from '../../services/api';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '', phone: '', nic: '', role: '', status: '', password: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const data = response.data;
      setUsers(data);
      setFilteredUsers(data);
      calculateStats(data);
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const total = userList.length;
    const active = userList.filter(u => u.status === 'ACTIVE').length;
    const blocked = userList.filter(u => u.status === 'BLOCKED').length;
    setStats({ total, active, blocked });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(u => 
      u.fullName.toLowerCase().includes(text.toLowerCase()) || 
      u.email.toLowerCase().includes(text.toLowerCase()) ||
      u.nic.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      fullName: user.fullName,
      phone: user.phone,
      nic: user.nic,
      role: user.role,
      status: user.status,
      password: ''
    });
    setEditModalVisible(true);
  };

  // Save & Update
  const handleSaveUpdate = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const updateData = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        nic: editForm.nic,
        role: editForm.role,
        status: editForm.status,
      };
      if (editForm.password.trim()) {
        updateData.password = editForm.password;
      }
      await api.put(`/users/${editUser._id}`, updateData);
      setEditModalVisible(false);
      fetchUsers();
      Alert.alert('Success', 'User account updated successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  // Delete from Modal
  const handleDeleteFromModal = () => {
    if (!editUser) return;
    const confirmDelete = () => {
      api.delete(`/users/${editUser._id}`)
        .then(() => {
          setEditModalVisible(false);
          fetchUsers();
          Alert.alert('Success', 'User deleted');
        })
        .catch(() => Alert.alert('Error', 'Failed to delete user'));
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete ${editUser.fullName}?`)) confirmDelete();
    } else {
      Alert.alert('Confirm Delete', `Permanently delete ${editUser.fullName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete }
      ]);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      await api.put(`/users/${userId}/block`);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="large" color="#c9a052" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnTxt}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search records..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>customers & admins • system records</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL USERS</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statTrend}>↑ System accounts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ACTIVE USERS</Text>
            <Text style={[styles.statValue, { color: '#2e7d32' }]}>{stats.active}</Text>
            <Text style={styles.statTrend}>↑ Regular status</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BLOCKED USERS</Text>
            <Text style={[styles.statValue, { color: '#d32f2f' }]}>{stats.blocked}</Text>
            <Text style={styles.statTrend}>↓ Restricted access</Text>
          </View>
        </View>

        {/* Directory Section */}
        <View style={styles.directoryHeader}>
          <Text style={styles.dirTitle}>👤 User Directory • manage accounts</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 220 }]}>USER INFO</Text>
              <Text style={[styles.th, { width: 120 }]}>NIC</Text>
              <Text style={[styles.th, { width: 120 }]}>CONTACT</Text>
              <Text style={[styles.th, { width: 100 }]}>ROLE</Text>
              <Text style={[styles.th, { width: 100 }]}>STATUS</Text>
              <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>ACTIONS</Text>
            </View>

            {filteredUsers.map((u) => (
              <View key={u._id} style={styles.tableRow}>
                <View style={[styles.td, { width: 220, flexDirection: 'row', alignItems: 'center' }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTxt}>{u.fullName[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.uName}>{u.fullName}</Text>
                    <Text style={styles.uEmail}>{u.email}</Text>
                  </View>
                </View>
                <Text style={[styles.td, { width: 120 }]}>{u.nic}</Text>
                <Text style={[styles.td, { width: 120 }]}>{u.phone}</Text>
                <View style={[styles.td, { width: 100 }]}>
                  <View style={[styles.badge, u.role === 'Admin' ? styles.badgeAdmin : styles.badgeCust]}>
                    <Text style={styles.badgeTxt}>{u.role}</Text>
                  </View>
                </View>
                <View style={[styles.td, { width: 100 }]}>
                  <View style={[styles.statusPill, u.status === 'ACTIVE' ? styles.statusActive : styles.statusBlocked]}>
                    <Text style={styles.statusTxt}>• {u.status}</Text>
                  </View>
                </View>
                <View style={[styles.td, { width: 120, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                  <TouchableOpacity 
                    onPress={() => handleToggleBlock(u._id)}
                    style={styles.actionBtn}
                  >
                    <Text>{u.status === 'ACTIVE' ? '🚫' : '✅'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => openEditModal(u)}
                    style={styles.actionBtn}
                  >
                    <Text>📝</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      const confirmDelete = () => {
                        api.delete(`/users/${u._id}`)
                          .then(() => fetchUsers())
                          .catch(() => Alert.alert('Error', 'Failed to delete user'));
                      };
                      if (Platform.OS === 'web') {
                        if (window.confirm(`Delete ${u.fullName}?`)) confirmDelete();
                      } else {
                        Alert.alert('Confirm', `Delete ${u.fullName}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: confirmDelete }
                        ]);
                      }
                    }}
                    style={[styles.actionBtn, { borderColor: '#ffcdd2' }]}
                  >
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ===== MODIFY USER MODAL ===== */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modify User Account</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalForm}>
                {/* Row 1: Full Name, Phone, NIC */}
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>FULL NAME</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editForm.fullName}
                      onChangeText={t => setEditForm({...editForm, fullName: t})}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>PHONE NUMBER</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editForm.phone}
                      onChangeText={t => setEditForm({...editForm, phone: t})}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>NIC NUMBER</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editForm.nic}
                      onChangeText={t => setEditForm({...editForm, nic: t})}
                    />
                  </View>
                </View>

                {/* Row 2: Role, Status, Password */}
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>SYSTEM ROLE</Text>
                    <View style={styles.pickerWrapper}>
                      <TouchableOpacity
                        style={styles.formInput}
                        onPress={() => setEditForm({...editForm, role: editForm.role === 'Customer' ? 'Admin' : 'Customer'})}
                      >
                        <Text style={{ color: '#111318' }}>{editForm.role} ▾</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>ACCOUNT STATUS</Text>
                    <View style={styles.pickerWrapper}>
                      <TouchableOpacity
                        style={styles.formInput}
                        onPress={() => setEditForm({...editForm, status: editForm.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'})}
                      >
                        <Text style={{ color: '#111318' }}>{editForm.status} ▾</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>RESET PASSWORD</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editForm.password}
                      onChangeText={t => setEditForm({...editForm, password: t})}
                      placeholder="Enter new password to reset"
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteFromModal}>
                    <Text style={styles.deleteBtnTxt}>Delete Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
                    onPress={handleSaveUpdate}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.saveBtnTxt}>Save & Update</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0ebe0' },
  
  header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  backBtn: { paddingVertical: 5 },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold' },
  searchContainer: { flex: 1, marginLeft: 20 },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0f1117' },
  subtitle: { fontSize: 13, color: '#6c757d', marginTop: 4 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 25 },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#6c757d', marginBottom: 5 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f1117' },
  statTrend: { fontSize: 10, color: '#2e7d32', marginTop: 5 },

  directoryHeader: { paddingHorizontal: 20, marginBottom: 15 },
  dirTitle: { fontSize: 16, fontWeight: 'bold', color: '#c9a052' },

  table: { backgroundColor: '#ffffff', marginHorizontal: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  th: { fontSize: 11, fontWeight: 'bold', color: '#6c757d', paddingHorizontal: 15, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f4f4f4', paddingVertical: 12, alignItems: 'center' },
  td: { fontSize: 13, color: '#333', paddingHorizontal: 15 },
  
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#c9a052', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  uName: { fontWeight: 'bold', color: '#111', fontSize: 14 },
  uEmail: { fontSize: 11, color: '#888' },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  badgeAdmin: { backgroundColor: '#e8eaf6' },
  badgeCust: { backgroundColor: '#f3e5f5' },
  badgeTxt: { fontSize: 10, fontWeight: 'bold', color: '#555' },

  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusActive: { backgroundColor: '#e8f5e9' },
  statusBlocked: { backgroundColor: '#ffebee' },
  statusTxt: { fontSize: 10, fontWeight: 'bold', color: '#444' },

  actionBtn: { width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },

  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 25, width: '100%', maxWidth: 700, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111318' },
  closeBtn: { fontSize: 22, color: '#888' },

  modalForm: { width: '100%' },
  formRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  formCol: { flex: 1 },
  formLabel: { fontSize: 10, fontWeight: 'bold', color: '#c9a052', marginBottom: 8, letterSpacing: 0.5 },
  formInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111318',
  },
  pickerWrapper: {},

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  deleteBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444' },
  deleteBtnTxt: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  saveBtn: { backgroundColor: '#111318', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  saveBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default UserManagementScreen;

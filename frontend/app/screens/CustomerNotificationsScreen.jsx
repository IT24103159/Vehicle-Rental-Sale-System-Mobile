import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import api from '../../services/api';

const CustomerNotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.log('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#c9a052" />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🔔</Text>
            <Text style={styles.emptyTxt}>No new notifications.</Text>
          </View>
        ) : (
          notifications.map(n => (
            <TouchableOpacity
              key={n._id}
              style={[styles.card, !n.isRead && styles.unreadCard]}
              onPress={() => !n.isRead && markAsRead(n._id)}
            >
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 24 }}>{n.type === 'Promotion' ? '🎁' : '🔔'}</Text>
              </View>
              <View style={styles.contentBox}>
                <Text style={styles.typeTxt}>{n.type}</Text>
                {n.imageUrl && (
                  <TouchableOpacity onPress={() => setSelectedImage(n.imageUrl)}>
                    <Image source={{ uri: n.imageUrl }} style={styles.notificationImg} />
                  </TouchableOpacity>
                )}
                <Text style={[styles.msgTxt, !n.isRead && { fontWeight: 'bold', color: '#111318' }]}>{n.message}</Text>
                <Text style={styles.timeTxt}>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}</Text>
              </View>
              {!n.isRead && <View style={styles.dot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedImage(null)}>
              <Text style={styles.closeBtnTxt}>✕ Close</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  header: { padding: 20, backgroundColor: '#f0ebe0', flexDirection: 'row', alignItems: 'center' },
  backBtnTxt: { color: '#000000', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#111318', marginRight: 40 },

  scrollContent: { padding: 20 },

  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, alignItems: 'center', elevation: 1 },
  unreadCard: { backgroundColor: '#fcf8ec', borderWidth: 1, borderColor: '#f2dfa7' },

  iconBox: { width: 50, height: 50, backgroundColor: '#f0ebe0', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contentBox: { flex: 1 },

  typeTxt: { fontSize: 11, color: '#c9a052', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  msgTxt: { fontSize: 14, color: '#555', lineHeight: 20 },
  timeTxt: { fontSize: 11, color: '#888', marginTop: 5 },
  notificationImg: { width: '100%', height: 120, borderRadius: 8, marginVertical: 8, resizeMode: 'cover' },

  dot: { width: 10, height: 10, backgroundColor: '#c9a052', borderRadius: 5, marginLeft: 10 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyTxt: { color: '#888', fontSize: 14 },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '95%', height: '80%' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  closeBtnTxt: { color: '#fff', fontWeight: 'bold' },
});

export default CustomerNotificationsScreen;

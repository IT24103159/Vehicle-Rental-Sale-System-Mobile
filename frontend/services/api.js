import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  return 'http://10.45.50.182:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      let storedUser = null;
      if (Platform.OS === 'web') {
        storedUser = localStorage.getItem('user');
      } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        storedUser = await AsyncStorage.getItem('user');
      }
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      // Token attach failed silently
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

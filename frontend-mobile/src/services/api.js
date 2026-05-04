import axiosInstance from './axiosConfig';

// Authentication Services
export const authService = {
  register: async (name, email, phone, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        phone,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMe: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// User Services
export const userService = {
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateUser: async (userId, name, email, phone) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, {
        name,
        email,
        phone,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

import axiosInstance from './axiosConfig';

// Authentication Services
export const authService = {
  register: async (name, email, phone, password, role = 'user') => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role,
      });
      return response.data;
    } catch (error) {
      const firstValidationError = error.response?.data?.errors?.[0]?.msg;
      const message = firstValidationError || error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
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
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
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

  updateUser: async (userId, name, email, phone, file = null) => {
    try {
      // Support optional file upload when a `file` argument is provided
      if (file) {
        const formData = new FormData();
        if (name) formData.append('name', name);
        if (email) formData.append('email', email);
        if (phone) formData.append('phone', phone);
        formData.append('profileImage', file);

        const response = await axiosInstance.put(`/users/${userId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

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

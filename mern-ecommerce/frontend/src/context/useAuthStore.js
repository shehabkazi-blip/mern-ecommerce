import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null,

  isAdmin: () => get().user?.role === 'admin',

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      set({ user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', payload);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      set({ user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null });
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch (err) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null });
    }
  },
}));

export default useAuthStore;

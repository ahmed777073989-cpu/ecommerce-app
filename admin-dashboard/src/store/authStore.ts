import { create } from 'zustand';
import { authApi } from '../api/auth';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  active: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (phone: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(phone, password);
      const { user, accessToken, refreshToken } = response.data;

      if (user.role !== 'super_admin' && user.role !== 'admin') {
        throw new Error('Insufficient permissions. Admin access required.');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  loadStoredAuth: () => {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (accessToken && userStr) {
      const user = JSON.parse(userStr);
      set({
        accessToken,
        user,
        isAuthenticated: true,
      });
    }
  },
}));

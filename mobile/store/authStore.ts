import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  login: (phone: string, password: string) => Promise<any>;
  signup: (name: string, phone: string, password: string, confirmPassword: string) => Promise<any>;
  activate: (accessCode: string) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,

  setTokens: async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userStr = await AsyncStorage.getItem('user');

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (phone: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(phone, password);
      const { user, accessToken, refreshToken } = response.data;
      
      await get().setTokens(accessToken, refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      get().setUser(user);
      
      set({ isLoading: false });
      return { success: true, data: user };
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (name: string, phone: string, password: string, confirmPassword: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.signup({ name, phone, password, confirmPassword });
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  activate: async (phone: string, password: string, accessCode: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.activate(phone, password, accessCode);
      const user = response.data;
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      get().setUser(user);
      
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

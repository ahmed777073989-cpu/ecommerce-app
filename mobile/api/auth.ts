import apiClient from './client';

export const authApi = {
  signup: async (data: { name: string; phone: string; password: string; confirmPassword: string }) => {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
  },

  activate: async (phone: string, password: string, accessCode: string) => {
    const response = await apiClient.post('/api/auth/activate', { phone, password, accessCode });
    return response.data;
  },

  login: async (phone: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { phone, password });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

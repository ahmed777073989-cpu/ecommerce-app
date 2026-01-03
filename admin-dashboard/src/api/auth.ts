import apiClient from './client';

export const authApi = {
  login: async (phone: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { phone, password });
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

export const adminApi = {
  generateCodes: async (data: {
    role: string;
    validDays: number;
    usesAllowed: number;
    count?: number;
    note?: string;
  }) => {
    const response = await apiClient.post('/api/admin/access-codes/generate', data);
    return response.data;
  },

  listCodes: async (page: number = 1, limit: number = 50) => {
    const response = await apiClient.get('/api/admin/access-codes', {
      params: { page, limit },
    });
    return response.data;
  },
};

import { apiClient } from './apiClient';

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  role: 'client' | 'rider' | 'admin';
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    role: 'client' | 'rider' | 'admin';

  };
  access_token?: string;
  message?: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  login: async (phone: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { phone, password });
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  verifyOTP: async (otp: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', { otp });
    return response.data;
  },

  resetPassword: async (email: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/reset-password', { email });
    return response.data;
  },


};
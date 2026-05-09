import { apiClient } from '@/lib/api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/lib/types';

export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/api/auth/register', data).then(r => r.data),
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', data).then(r => r.data),
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken }).then(r => r.data),
  revoke: (refreshToken: string) =>
    apiClient.post('/api/auth/revoke', { refreshToken }),
  logout: () => apiClient.post('/api/auth/logout'),
  me: () => apiClient.get<User>('/api/auth/me').then(r => r.data),
  updateProfile: (data: { firstName: string; lastName: string }) =>
    apiClient.put<User>('/api/auth/profile', data).then(r => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/api/auth/change-password', data)
};

import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './storage';
import type { AuthResponse } from './types';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ---- Auth event bus -------------------------------------------------------
type AuthEvent = 'logout' | 'refreshed';
const listeners: Record<AuthEvent, Array<() => void>> = { logout: [], refreshed: [] };
export const authBus = {
  on(evt: AuthEvent, fn: () => void) { listeners[evt].push(fn); return () => { listeners[evt] = listeners[evt].filter(f => f !== fn); }; },
  emit(evt: AuthEvent) { listeners[evt].forEach(fn => fn()); }
};

// ---- Request interceptor: attach access token -----------------------------
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Refresh token rotation logic with concurrent-request queue -----------
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

async function performRefresh(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error('Missing refresh token');

  // Use a fresh axios instance to avoid the interceptor loop
  const { data } = await axios.post<AuthResponse>(
    `${API_URL}/api/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );
  tokenStorage.setTokens(data.accessToken, data.refreshToken, data.expiresAt);
  authBus.emit('refreshed');
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // Don't try to refresh on auth endpoints to avoid loops
    const url = original?.url ?? '';
    const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/refresh') ||
                           url.includes('/api/auth/register') || url.includes('/api/auth/revoke');

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              if (original.headers) (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
              original._retry = true;
              resolve(apiClient(original));
            },
            reject: (err) => reject(err)
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const newToken = await performRefresh();
        processQueue(null, newToken);
        if (original.headers) (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        authBus.emit('logout');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; details?: string[] }>;
  const data = axiosError.response?.data;
  if (data?.details && data.details.length > 0) return data.details.join(', ');
  if (data?.message) return data.message;
  if (axiosError.message) return axiosError.message;
  return 'Erro inesperado.';
}

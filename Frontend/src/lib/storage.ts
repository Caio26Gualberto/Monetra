import type { User } from './types';

const ACCESS_KEY = 'monetra_access_token';
const REFRESH_KEY = 'monetra_refresh_token';
const USER_KEY = 'monetra_user';
const EXPIRES_KEY = 'monetra_expires_at';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  getExpiresAt: () => localStorage.getItem(EXPIRES_KEY),

  set: (data: { accessToken: string; refreshToken: string; expiresAt: string; user: User }) => {
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    localStorage.setItem(EXPIRES_KEY, data.expiresAt);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  },

  setTokens: (accessToken: string, refreshToken: string, expiresAt: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }
};

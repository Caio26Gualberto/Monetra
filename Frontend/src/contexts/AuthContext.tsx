import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authBus } from '@/lib/api';
import { tokenStorage } from '@/lib/storage';
import type { User, LoginRequest, RegisterRequest } from '@/lib/types';
import { authService } from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => tokenStorage.getUser());
  const [loading, setLoading] = useState(true);

  // Hydrate user from server if we have token (validates it)
  useEffect(() => {
    const access = tokenStorage.getAccess();
    if (!access) {
      setLoading(false);
      return;
    }
    authService.me()
      .then(u => setUser(u))
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Subscribe to logout events from API client (refresh failures)
  useEffect(() => {
    return authBus.on('logout', () => setUser(null));
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authService.login(data);
    tokenStorage.set(res);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authService.register(data);
    tokenStorage.set(res);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefresh();
    try {
      if (refreshToken) await authService.revoke(refreshToken);
    } catch { /* ignore network errors on logout */ }
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const u = await authService.me();
    setUser(u);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

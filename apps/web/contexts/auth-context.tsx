'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import type { User } from '@transitops/shared';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (email: string, password: string, role: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService.me()
      .then(setUser)
      .catch(() => deleteCookie('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, role: string) => {
    const res = await authService.login(email, password, role);
    setCookie('token', res.token, 60 * 60 * 24 * 30);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, role: string, name?: string) => {
    const res = await authService.register(email, password, role, name);
    setCookie('token', res.token, 60 * 60 * 24 * 30);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    deleteCookie('token');
    setUser(null);
    window.location.href = 'http://localhost:3001/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

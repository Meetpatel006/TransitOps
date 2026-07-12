import { api } from '@/lib/api';
import type { AuthOut, User } from '@transitops/shared';

export const authService = {
  login: (email: string, password: string, role: string) =>
    api<AuthOut>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  register: (email: string, password: string, role: string, name?: string) =>
    api<AuthOut>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, name }),
    }),

  me: () => api<User>('/api/auth/me'),

  logout: () =>
    api<void>('/api/auth/logout', { method: 'POST' }),
};

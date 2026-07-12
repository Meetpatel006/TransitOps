import { api } from '@/lib/api';
import type { Driver } from '@transitops/shared';

export const driversService = {
  list: (statusFilter?: string) => {
    const params = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
    return api<Driver[]>(`/api/drivers${params}`);
  },

  get: (id: number) => api<Driver>(`/api/drivers/${id}`),

  create: (data: Omit<Driver, 'id' | 'status'>) =>
    api<Driver>('/api/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Omit<Driver, 'id'>>) =>
    api<Driver>(`/api/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    api<void>(`/api/drivers/${id}`, { method: 'DELETE' }),
};

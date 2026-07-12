import { api } from '@/lib/api';
import type { Vehicle } from '@transitops/shared';

export const vehiclesService = {
  list: (statusFilter?: string) => {
    const params = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
    return api<Vehicle[]>(`/api/vehicles${params}`);
  },

  get: (id: number) => api<Vehicle>(`/api/vehicles/${id}`),

  create: (data: Omit<Vehicle, 'id' | 'status'>) =>
    api<Vehicle>('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Omit<Vehicle, 'id'>>) =>
    api<Vehicle>(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    api<void>(`/api/vehicles/${id}`, { method: 'DELETE' }),
};

import { api } from '@/lib/api';
import type { Trip } from '@transitops/shared';

export const tripsService = {
  list: (statusFilter?: string) => {
    const params = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
    return api<Trip[]>(`/api/trips${params}`);
  },

  get: (id: number) => api<Trip>(`/api/trips/${id}`),

  create: (data: Omit<Trip, 'id' | 'status' | 'final_odometer' | 'fuel_consumed'>) =>
    api<Trip>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Omit<Trip, 'id'>>) =>
    api<Trip>(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  dispatch: (id: number) =>
    api<Trip>(`/api/trips/${id}/dispatch`, { method: 'POST' }),

  complete: (id: number, finalOdometer: number, fuelConsumed: number) =>
    api<Trip>(`/api/trips/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ final_odometer: finalOdometer, fuel_consumed: fuelConsumed }),
    }),

  cancel: (id: number) =>
    api<Trip>(`/api/trips/${id}/cancel`, { method: 'POST' }),
};

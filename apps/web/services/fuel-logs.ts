import { api } from '@/lib/api';
import type { FuelLog } from '@transitops/shared';

export const fuelLogsService = {
  list: (vehicleId?: number) => {
    const params = vehicleId ? `?vehicle_id=${vehicleId}` : '';
    return api<FuelLog[]>(`/api/fuel-logs${params}`);
  },

  get: (id: number) => api<FuelLog>(`/api/fuel-logs/${id}`),

  create: (data: Omit<FuelLog, 'id'>) =>
    api<FuelLog>('/api/fuel-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Omit<FuelLog, 'id'>>) =>
    api<FuelLog>(`/api/fuel-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    api<void>(`/api/fuel-logs/${id}`, { method: 'DELETE' }),
};

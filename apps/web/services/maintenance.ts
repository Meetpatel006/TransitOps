import { api } from '@/lib/api';
import type { MaintenanceLog } from '@transitops/shared';

export const maintenanceService = {
  list: (vehicleId?: number) => {
    const params = vehicleId ? `?vehicle_id=${vehicleId}` : '';
    return api<MaintenanceLog[]>(`/api/maintenance${params}`);
  },

  get: (id: number) => api<MaintenanceLog>(`/api/maintenance/${id}`),

  create: (data: { vehicle_id: number; title: string; description?: string; cost?: number }) =>
    api<MaintenanceLog>('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Pick<MaintenanceLog, 'title' | 'description' | 'cost' | 'status'>>) =>
    api<MaintenanceLog>(`/api/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    api<void>(`/api/maintenance/${id}`, { method: 'DELETE' }),
};

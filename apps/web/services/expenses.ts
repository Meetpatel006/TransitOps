import { api } from '@/lib/api';
import type { Expense } from '@transitops/shared';

export const expensesService = {
  list: (vehicleId?: number) => {
    const params = vehicleId ? `?vehicle_id=${vehicleId}` : '';
    return api<Expense[]>(`/api/expenses${params}`);
  },

  get: (id: number) => api<Expense>(`/api/expenses/${id}`),

  create: (data: Omit<Expense, 'id'>) =>
    api<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Omit<Expense, 'id'>>) =>
    api<Expense>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    api<void>(`/api/expenses/${id}`, { method: 'DELETE' }),
};

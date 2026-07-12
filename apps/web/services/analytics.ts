import { api } from '@/lib/api';
import type { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '@transitops/shared';

export interface AnalyticsData {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuel_logs: FuelLog[];
  expenses: Expense[];
}

export const analyticsService = {
  get: () => api<AnalyticsData>('/api/analytics'),
};

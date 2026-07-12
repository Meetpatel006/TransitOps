export interface User {
  id: number
  email: string
  name: string | null
  role_name: string | null
}

export * from './rbac';

export interface ApiResponse<T = unknown> {
  data: T
  error?: string
}

export interface Vehicle {
  id: number
  registration_number: string
  name_model: string
  type: 'Van' | 'Truck' | 'Mini' | string
  maximum_load_capacity: number
  odometer: number
  acquisition_cost: number
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired' | string
}

export interface Driver {
  id: number
  name: string
  license_number: string
  license_category: string
  license_expiry_date: string
  contact_number: string
  safety_score: number | null
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended' | string
}

export interface Trip {
  id: number
  source: string
  destination: string
  vehicle_id: number
  driver_id: number
  cargo_weight: number
  planned_distance: number
  status: string
  final_odometer: number | null
  fuel_consumed: number | null
}

export interface MaintenanceLog {
  id: number
  vehicle_id: number
  title: string
  description: string | null
  cost: number
  status: string
  start_date: string
  end_date: string | null
}

export interface FuelLog {
  id: number
  vehicle_id: number
  liters: number
  cost: number
  date: string
}

export interface Expense {
  id: number
  vehicle_id: number
  cost: number
  date: string
  category: string
  notes: string | null
}

export interface AuthOut {
  token: string
  user: User
}

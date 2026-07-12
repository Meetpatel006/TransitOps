export interface User {
  id: number
  email: string
  name: string | null
}

export interface ApiResponse<T = unknown> {
  data: T
  error?: string
}

export interface Driver {
  id: number
  name: string
  license_number: string
  license_category: 'LMV' | 'HMV'
  license_expiry: string
  contact: string
  safety_score: number
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended'
}

export interface Vehicle {
  id: number
  registration_number: string
  name_model: string
  type: 'Van' | 'Truck' | 'Mini'
  capacity_kg: number
  odometer: number
  acquisition_cost: number
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
}

export interface User {
  id: number
  email: string
  name: string | null
}

export interface ApiResponse<T = unknown> {
  data: T
  error?: string
}

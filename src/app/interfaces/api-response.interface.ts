export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

export interface ApiListResponse<T> {
  data: T[]
  success: boolean
  message?: string
  errors?: string[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: string[]
  statusCode?: number
}

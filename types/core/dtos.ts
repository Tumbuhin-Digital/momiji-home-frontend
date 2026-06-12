export interface PaginatedResult<T> {
  data: T[]
  limit: number
  page: number
  total: number
  totalPages: number
}

export interface BaseResponse<T = undefined> {
  status: string
  message: string
  data?: T
  timestamp: string
  error?: {
    code: string
    details: string
  }
}

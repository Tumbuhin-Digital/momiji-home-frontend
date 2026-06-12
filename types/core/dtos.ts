export interface PaginatedResult<T> {
  data: T[]
  limit: number
  page: number
  total: number
  totalPages: number
}

export interface BaseResponse<T = undefined> {
  data?: T
  error?: {
    code: string
    details: string
  }
  message: string
  status: string
  timestamp: string
}

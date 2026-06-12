export interface CustomerQueryParams {
  search?: string
  page?: number
  limit?: number
}

export interface CustomerResponseDto {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  orders_count: number
  created_at: string
}

export interface AddressResponseDto {
  id: string
  first_name: string
  last_name: string
  address1: string
  address2?: string
  city: string
  province: string
  country: string
  zip: string
  phone?: string
  is_default: boolean
}

export interface CustomerDetailResponseDto extends CustomerResponseDto {
  addresses: AddressResponseDto[]
}

export interface CustomerOrderResponseDto {
  id: string
  aggregate_status: string
  total_price: number
  created_at: string
}

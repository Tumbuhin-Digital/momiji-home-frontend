export interface CustomerQueryParams {
  limit?: number
  page?: number
  search?: string
}

export interface CustomerResponseDto {
  created_at: string
  email: string
  first_name: string
  id: string
  last_name: string
  orders_count: number
  phone?: string
}

export interface AddressResponseDto {
  address1: string
  address2?: string
  city: string
  country: string
  first_name: string
  id: string
  is_default: boolean
  last_name: string
  phone?: string
  province: string
  zip: string
}

export interface CustomerDetailResponseDto extends CustomerResponseDto {
  addresses: AddressResponseDto[]
}

export interface CustomerOrderResponseDto {
  aggregate_status: string
  created_at: string
  id: string
  total_price: number
}

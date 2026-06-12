import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type { Customer, CustomerOrder } from "@/types/customers"
import type {
  CustomerDetailResponseDto,
  CustomerOrderResponseDto,
  CustomerQueryParams,
  CustomerResponseDto,
} from "@/types/customers/dtos"

function mapCustomerDto(dto: CustomerResponseDto): Customer {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.first_name,
    lastName: dto.last_name,
    phone: dto.phone,
    ordersCount: dto.orders_count,
    createdAt: dto.created_at,
  }
}

export const customerService = {
  async getCustomers(params: CustomerQueryParams = {}): Promise<Customer[]> {
    const response = await apiClient.get<BaseResponse<CustomerResponseDto[]>>(
      "/customers",
      { params }
    )
    return (response.data ?? []).map(mapCustomerDto)
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const response = await apiClient.get<
      BaseResponse<CustomerDetailResponseDto>
    >(`/customers/${id}`)
    if (!response.data) return null
    return {
      ...mapCustomerDto(response.data),
      addresses: response.data.addresses?.map((a) => ({
        id: a.id,
        firstName: a.first_name,
        lastName: a.last_name,
        address1: a.address1,
        address2: a.address2,
        city: a.city,
        province: a.province,
        country: a.country,
        zip: a.zip,
        phone: a.phone,
        isDefault: a.is_default,
      })),
    }
  },

  async getCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
    const response = await apiClient.get<
      BaseResponse<CustomerOrderResponseDto[]>
    >(`/customers/${customerId}/orders`)
    return (response.data ?? []).map((dto) => ({
      id: dto.id,
      aggregateStatus: dto.aggregate_status,
      totalPrice: dto.total_price,
      createdAt: dto.created_at,
    }))
  },
}

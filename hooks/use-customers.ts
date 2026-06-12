"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { customerService } from "@/lib/services"

import type { UseQueryOptions } from "@tanstack/react-query"
import type {
  Customer,
  CustomerOrder,
  CustomerQueryParams,
} from "@/types/customers"

export function useCustomers(
  params: CustomerQueryParams = {},
  options?: Omit<UseQueryOptions<Customer[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customerService.getCustomers(params),
    ...options,
  })
}

export function useCustomerById(
  id: string,
  options?: Omit<UseQueryOptions<Customer | null>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customerService.getCustomerById(id),
    enabled: id.length > 0,
    ...options,
  })
}

export function useCustomerOrders(
  customerId: string,
  options?: Omit<UseQueryOptions<CustomerOrder[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.customers.orders(customerId),
    queryFn: () => customerService.getCustomerOrders(customerId),
    enabled: customerId.length > 0,
    ...options,
  })
}

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { ordersService } from "@/lib/services"

import type { UseQueryOptions } from "@tanstack/react-query"
import type { Order, OrderQueryParams } from "@/types/orders"

export function useOrders(
  params: OrderQueryParams = {},
  options?: Omit<UseQueryOptions<Order[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersService.getOrders(params),
    ...options,
  })
}

export function useOrderById(
  orderId: string,
  options?: Omit<UseQueryOptions<Order | null>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => ordersService.getOrderById(orderId),
    enabled: orderId.length > 0,
    ...options,
  })
}

export function useAcceptOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      fulfillmentType = "ship_ready",
    }: {
      orderId: string
      fulfillmentType?: string
    }) => ordersService.acceptOrder(orderId, fulfillmentType),
    onSuccess: (order) => {
      if (order) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.sync.all })
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      }
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      fulfillmentType = "ship_ready",
    }: {
      orderId: string
      reason: string
      fulfillmentType?: string
    }) => ordersService.cancelOrder(orderId, reason, fulfillmentType),
    onSuccess: (order) => {
      if (order) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      }
    },
  })
}

import type { CreateOrderInput } from "@/types/orders/dtos"

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}

import type {
  UpdateReceivedDto,
  UpdateStepDto,
  UpdateTrackingDto,
} from "@/types/orders/dtos"

export function useUpdateItemReceived() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      body,
    }: {
      orderId: string
      itemId: string
      body: UpdateReceivedDto
    }) => ordersService.updateItemReceived(orderId, itemId, body),
    onSuccess: (order, variables) => {
      if (order) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(variables.orderId),
        })
        // Update local cache if needed
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      }
    },
  })
}

export function useUpdateItemStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      body,
    }: {
      orderId: string
      itemId: string
      body: UpdateStepDto
    }) => ordersService.updateItemStep(orderId, itemId, body),
    onSuccess: (order, variables) => {
      if (order) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(variables.orderId),
        })
        // Update local cache if needed
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      }
    },
  })
}

export function useUpdateItemTracking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      body,
    }: {
      orderId: string
      itemId: string
      body: UpdateTrackingDto
    }) => ordersService.updateItemTracking(orderId, itemId, body),
    onSuccess: (order, variables) => {
      if (order) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(variables.orderId),
        })
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      }
    },
  })
}

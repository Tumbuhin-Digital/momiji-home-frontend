/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { ordersService } from "@/lib/services"

import type { UseQueryOptions } from "@tanstack/react-query"
import type { LiveTrackingInfo, Order, OrderQueryParams } from "@/types/orders"
import type {
  CreateOrderInput,
  UpdateReceivedDto,
  UpdateStepDto,
  UpdateTrackingDto,
} from "@/types/orders/dtos"

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
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      if (order) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
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
      // Always invalidate list regardless of whether response has order data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      if (order) {
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      }
    },
  })
}

export function useExportOrders() {
  return useMutation({
    mutationFn: (params: { status?: string; search?: string } = {}) =>
      ordersService.exportOrders(params),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
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

export function useInfiniteOrders(
  params: OrderQueryParams = {},
  options?: any
) {
  return useInfiniteQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: ({ pageParam }) =>
      ordersService.getOrdersPaginated({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...options,
  })
}

export function useItemTracking(
  orderId: string,
  itemId: string,
  options?: Omit<
    UseQueryOptions<LiveTrackingInfo | null>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.orders.tracking(orderId, itemId),
    queryFn: () => ordersService.getItemTracking(orderId, itemId),
    enabled: orderId.length > 0 && itemId.length > 0,
    ...options,
  })
}

export function useUpdateItemReceived() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      body,
    }: {
      orderId: string
      body: UpdateReceivedDto
    }) => ordersService.updateItemReceived(orderId, body),
    onSuccess: (order, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(variables.orderId),
      })
      if (order) {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(variables.orderId),
      })
      if (order) {
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
      body,
    }: {
      orderId: string
      body: UpdateTrackingDto
    }) => ordersService.updateItemTracking(orderId, body),
    onSuccess: (order, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      if (order) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(variables.orderId),
        })
        queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      }
    },
  })
}

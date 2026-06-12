/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/api"
import { mapOrderResponseToOrder } from "@/types/orders/entities"

import type { BaseResponse } from "@/types/core"
import type { Order, OrderQueryParams } from "@/types/orders"
import type {
  CreateOrderInput,
  OrderResponseDto,
  UpdateReceivedDto,
  UpdateStepDto,
  UpdateTrackingDto,
} from "@/types/orders/dtos"

async function getOrders(params: OrderQueryParams = {}): Promise<Order[]> {
  const response = await apiClient.get<BaseResponse<any>>("/orders", { params })
  const responseData = response.data || {}
  const items = Array.isArray(responseData)
    ? responseData
    : (responseData.orders ?? responseData.data ?? [])
  return items.map(mapOrderResponseToOrder)
}

async function getOrderById(orderId: string): Promise<Order | null> {
  const response = await apiClient.get<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}`
  )
  return response.data ? mapOrderResponseToOrder(response.data) : null
}

async function acceptOrder(
  orderId: string,
  fulfillmentType: string = "ship_ready"
): Promise<Order | null> {
  const response = await apiClient.patch<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}/accept`,
    { fulfillment_type: fulfillmentType }
  )
  return response.data ? mapOrderResponseToOrder(response.data) : null
}

async function cancelOrder(
  orderId: string,
  reason: string = "",
  fulfillmentType: string = "ship_ready"
): Promise<Order | null> {
  const response = await apiClient.patch<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}/cancel`,
    { fulfillment_type: fulfillmentType, reason }
  )
  return response.data ? mapOrderResponseToOrder(response.data) : null
}

async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await apiClient.post<BaseResponse<OrderResponseDto>>(
    "/orders",
    input
  )

  if (!response.data) {
    throw new Error("Failed to create order")
  }
  return mapOrderResponseToOrder(response.data)
}

async function updateItemReceived(
  orderId: string,
  itemId: string,
  body: UpdateReceivedDto
): Promise<Order | null> {
  const response = await apiClient.patch<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}/items/${itemId}/received`,
    body
  )
  return response.data ? mapOrderResponseToOrder(response.data) : null
}

async function updateItemStep(
  orderId: string,
  itemId: string,
  body: UpdateStepDto
): Promise<Order | null> {
  const response = await apiClient.patch<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}/items/${itemId}/step`,
    body
  )
  return response.data ? mapOrderResponseToOrder(response.data) : null
}

async function updateItemTracking(
  orderId: string,
  itemId: string,
  body: UpdateTrackingDto
): Promise<Order | null> {
  const response = await apiClient.patch<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}/items/${itemId}/tracking`,
    body
  )
  return response.data ? mapOrderResponseToOrder(response.data) : null
}

export const ordersService = {
  acceptOrder,
  cancelOrder,
  createOrder,
  getOrderById,
  getOrders,
  updateItemReceived,
  updateItemStep,
  updateItemTracking,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/api"
import { mapOrderResponseToOrder } from "@/types/orders/entities"

import type { BaseResponse } from "@/types/core"
import type { LiveTrackingInfo, Order, OrderQueryParams } from "@/types/orders"
import type {
  CalculatePreorderShippingRequest,
  CalculatePreorderShippingResponse,
  CreateOrderInput,
  CreateFulfillmentDto,
  FulfillmentDto,
  OrderResponseDto,
  PreorderShipmentDto,
  RequestSecondPaymentResponse,
  UpdatePreorderShippingRequest,
  UpdateReceivedDto,
  UpdateStepDto,
  UpdateTrackingDto,
  WebsiteDraftOrderDetailDto,
  WebsiteDraftOrderDto,
} from "@/types/orders/dtos"

export interface PaginatedOrders {
  orders: Order[]
  nextCursor?: number
  totalPages: number
  total: number
}

async function getOrders(params: OrderQueryParams = {}): Promise<Order[]> {
  const response = await apiClient.get<BaseResponse<any>>("/orders", { params })
  const responseData = response.data || {}
  const items = Array.isArray(responseData)
    ? responseData
    : (responseData.orders ?? responseData.data ?? [])
  return items.map(mapOrderResponseToOrder)
}

async function getOrdersPaginated(
  params: OrderQueryParams = {}
): Promise<PaginatedOrders> {
  const response = await apiClient.get<BaseResponse<any>>("/orders", { params })
  const responseData = response.data || {}
  const items = Array.isArray(responseData)
    ? responseData
    : (responseData.orders ?? responseData.data ?? [])

  const orders = items.map(mapOrderResponseToOrder)
  const currentPage = responseData.page || params.page || 1
  const totalPages = responseData.totalPages || responseData.total_pages || 1
  const total = responseData.total ?? responseData.total_orders ?? orders.length

  return {
    orders,
    nextCursor: currentPage < totalPages ? currentPage + 1 : undefined,
    totalPages,
    total,
  }
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
  body: UpdateReceivedDto
): Promise<Order | null> {
  const response = await apiClient.patch<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}/received`,
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
  body: UpdateTrackingDto
): Promise<Order | null> {
  const response = await apiClient.patch<BaseResponse<OrderResponseDto>>(
    `/orders/${orderId}/tracking`,
    body
  )
  return response.data ? mapOrderResponseToOrder(response.data) : null
}

async function exportOrders(
  params: { status?: string; search?: string } = {}
): Promise<Blob> {
  return apiClient.get<Blob>("/orders/export", {
    params,
    responseType: "blob",
  })
}

async function getItemTracking(
  orderId: string,
  itemId: string
): Promise<LiveTrackingInfo | null> {
  const response = await apiClient.get<BaseResponse<LiveTrackingInfo>>(
    `/orders/${orderId}/items/${itemId}/tracking`
  )
  return response.data ?? null
}

async function calculatePreorderShipping(
  orderId: string,
  body: CalculatePreorderShippingRequest
): Promise<CalculatePreorderShippingResponse> {
  const response = await apiClient.post<
    BaseResponse<CalculatePreorderShippingResponse>
  >(`/orders/${orderId}/preorder/calculate-shipping`, body)
  if (!response.data) {
    throw new Error("Failed to calculate shipping")
  }
  return response.data
}

async function updatePreorderShipping(
  orderId: string,
  body: UpdatePreorderShippingRequest
): Promise<PreorderShipmentDto> {
  const response = await apiClient.put<BaseResponse<PreorderShipmentDto>>(
    `/orders/${orderId}/preorder/shipping`,
    body
  )
  if (!response.data) {
    throw new Error("Failed to update shipping")
  }
  return response.data
}

async function requestSecondPayment(
  orderId: string,
  body?: { batch_id?: string | null }
): Promise<RequestSecondPaymentResponse> {
  const response = await apiClient.post<
    BaseResponse<RequestSecondPaymentResponse>
  >(`/orders/${orderId}/preorder/request-second-payment`, body ?? {})
  if (!response.data?.invoice_url) {
    throw new Error("Payment link was not returned")
  }
  return response.data
}

async function resendSecondPaymentInvoice(
  orderId: string,
  body?: { batch_id?: string | null }
): Promise<void> {
  await apiClient.post(
    `/orders/${orderId}/preorder/resend-second-payment`,
    body ?? {}
  )
}

async function createFulfillment(
  orderId: string,
  body: CreateFulfillmentDto
): Promise<FulfillmentDto> {
  const response = await apiClient.post<BaseResponse<FulfillmentDto>>(
    `/orders/${orderId}/fulfillments`,
    body
  )
  if (!response.data) {
    throw new Error("Failed to create fulfillment")
  }
  return response.data
}

async function markFulfillmentDelivered(
  orderId: string,
  fulfillmentId: string
): Promise<void> {
  await apiClient.post(
    `/orders/${orderId}/fulfillments/${fulfillmentId}/delivered`
  )
}

async function getWebsiteDraftOrders(): Promise<WebsiteDraftOrderDto[]> {
  const response = await apiClient.get<BaseResponse<WebsiteDraftOrderDto[]>>(
    "/orders/drafts"
  )
  return response.data ?? []
}

async function updateWebsiteDraftItems(input: {
  draftOrderId: string
  shippingMethod?: string
  lineItems: Array<{ variantId: string; quantity: number }>
}): Promise<void> {
  await apiClient.put("/orders/drafts/items", {
    draft_order_id: input.draftOrderId,
    shipping_method: input.shippingMethod,
    line_items: input.lineItems.map((line) => ({
      variant_id: line.variantId,
      quantity: line.quantity,
    })),
  })
}

async function getWebsiteDraftOrder(
  id: string
): Promise<WebsiteDraftOrderDetailDto> {
  const response = await apiClient.get<BaseResponse<WebsiteDraftOrderDetailDto>>(
    "/orders/drafts/detail",
    { params: { id } }
  )
  if (!response.data) {
    throw new Error("Failed to load draft order")
  }
  return response.data
}

export const ordersService = {
  acceptOrder,
  cancelOrder,
  createOrder,
  exportOrders,
  getOrderById,
  getOrders,
  getOrdersPaginated,
  getWebsiteDraftOrders,
  getWebsiteDraftOrder,
  updateWebsiteDraftItems,
  getItemTracking,
  updateItemReceived,
  updateItemStep,
  updateItemTracking,
  calculatePreorderShipping,
  updatePreorderShipping,
  requestSecondPayment,
  resendSecondPaymentInvoice,
  createFulfillment,
  markFulfillmentDelivered,
}

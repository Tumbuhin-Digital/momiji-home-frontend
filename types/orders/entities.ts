import type { CurrencyCode } from "@/types/core"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type AggregateStatus =
  | "pending"
  | "processing"
  | "on_progress"
  | "paid"
  | "cancelled"
export type FulfillmentStatus =
  | "pending"
  | "in_progress"
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
export type PreOrderState =
  | "DP_PAID"
  | "AWAITING_PELUNASAN"
  | "FULLY_PAID"
  | "EXPIRED"
  | "CANCELLED"
export type OrderType = "ready" | "pre-order" | "mixed"

export interface LiveTrackingInfo {
  carrierCode: string
  estimatedDeliveryDate?: string
  shipDate?: string
  statusCode: string
  statusDescription: string
  trackingNumber: string
}

export interface OrderLineItem {
  currency: CurrencyCode
  fulfillmentStep?: number
  itemsReceived?: number
  itemStatus?: string
  productId: string
  quantity: number
  shopifyProductId: string
  sku: string
  title: string
  imageSrc?: string
  trackingCompany?: string
  trackingLastEvent?: string
  trackingNumber?: string
  trackingUrl?: string
  type?: string
  unitPrice: number
}

export interface Order {
  aggregateStatus: AggregateStatus
  currency: CurrencyCode
  customer: {
    email: string
    name: string
  } | null
  fulfillment: {
    carrier: string | null
    deliveredAt: string | null
    shippedAt: string | null
    trackingNumber: string | null
    trackingUrl: string | null
  }
  fulfillmentStatus: FulfillmentStatus
  id: string
  lineItems: OrderLineItem[]
  orderDate: string
  orderNumber: string
  parentOrderId?: string
  paymentStatus: PaymentStatus
  preOrderInfo?: {
    batch?: string
    dpAmount: number
    dpPaidAt?: string
    remainingAmount: number
    remainingPaidAt?: string
  }
  preOrderState?: PreOrderState
  shippingAddress: {
    address1: string
    address2?: string
    city: string
    country: string
    firstName: string
    lastName: string
    phone: string
    province: string
    zip: string
  } | null
  shopifyDraftOrderId?: string
  shopifyOrderId: string
  totalBalanceDue?: number
  totalChargedNow?: number
  totalDepositPaid?: number
  totalPrice: number
  totalShipReady?: number
  type: OrderType
}

import type { OrderResponseDto } from "./dtos"

export function mapOrderResponseToOrder(dto: OrderResponseDto): Order {
  const allItems = [
    ...(dto.line_items?.ship_ready ?? []),
    ...(dto.line_items?.pre_order ?? []),
  ]

  const hasShipReady = (dto.line_items?.ship_ready ?? []).length > 0
  const hasPreOrder = (dto.line_items?.pre_order ?? []).length > 0
  const type: OrderType =
    hasShipReady && hasPreOrder ? "mixed" : hasPreOrder ? "pre-order" : "ready"

  return {
    id: dto.id,
    aggregateStatus: dto.aggregate_status as AggregateStatus,
    shopifyOrderId: dto.shopify_checkout_url
      ? dto.shopify_checkout_url
      : dto.id,
    shopifyDraftOrderId: dto.shopify_draft_invoice_url ?? undefined,
    orderNumber: dto.order_number,
    type,
    customer: dto.customer
      ? {
          name: `${dto.customer.first_name || ""} ${dto.customer.last_name || ""}`.trim(),
          email: dto.customer.email || "",
        }
      : null,
    shippingAddress: dto.shipping_address
      ? {
          address1: dto.shipping_address.address1,
          address2: dto.shipping_address.address2,
          city: dto.shipping_address.city,
          country: dto.shipping_address.country,
          firstName: dto.shipping_address.first_name,
          lastName: dto.shipping_address.last_name,
          phone: dto.shipping_address.phone,
          province: dto.shipping_address.province,
          zip: dto.shipping_address.zip,
        }
      : null,
    lineItems: allItems.map((item) => ({
      productId: item.id,
      shopifyProductId: item.variant_id,
      title: item.title,
      sku: item.variant_id,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price) || 0,
      currency: (dto.currency as CurrencyCode) ?? "USD",
      fulfillmentStep: item.fulfillment_step,
      itemsReceived: item.items_received,
      itemStatus: item.item_status,
      imageSrc: item.image_src,
      trackingCompany: item.tracking_company,
      trackingLastEvent: item.tracking_last_event,
      trackingNumber: item.tracking_number,
      trackingUrl: item.tracking_url,
      type:
        item.type === "ship_ready"
          ? "ship-ready"
          : item.type === "pre_order"
            ? "pre-order"
            : item.type,
    })),
    totalBalanceDue: parseFloat(dto.total_balance_due) || 0,
    totalChargedNow: parseFloat(dto.total_charged_now) || 0,
    totalDepositPaid: parseFloat(dto.total_deposit_paid) || 0,
    totalPrice: parseFloat(dto.total_price) || 0,
    totalShipReady: parseFloat(dto.total_ship_ready) || 0,
    currency: (dto.currency as CurrencyCode) ?? "USD",
    paymentStatus: mapFinancialStatus(dto.financial_status),
    fulfillmentStatus: mapFulfillmentStatus(dto.fulfillment_status),
    preOrderState: undefined,
    preOrderInfo: hasPreOrder
      ? {
          dpAmount: parseFloat(dto.total_deposit_paid) || 0,
          remainingAmount: parseFloat(dto.total_balance_due) || 0,
          batch: undefined,
          dpPaidAt: undefined,
          remainingPaidAt: undefined,
        }
      : undefined,
    fulfillment: {
      trackingNumber: null,
      trackingUrl: null,
      carrier: null,
      shippedAt: null,
      deliveredAt: null,
    },
    orderDate: dto.order_date || "",
  }
}

function mapFinancialStatus(status: string): PaymentStatus {
  const map: Record<string, PaymentStatus> = {
    paid: "paid",
    pending: "pending",
    refunded: "refunded",
    voided: "failed",
    partially_paid: "pending",
    unpaid: "pending",
  }
  return map[status] ?? "pending"
}

function mapFulfillmentStatus(status: string): FulfillmentStatus {
  const map: Record<string, FulfillmentStatus> = {
    fulfilled: "shipped",
    unfulfilled: "unfulfilled",
    partial: "processing",
    cancelled: "cancelled",
    restocked: "cancelled",
  }
  return map[status] ?? "unfulfilled"
}

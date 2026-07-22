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
  dpAmount?: number
  balanceDue?: number
  finalAmount?: number
  weightKg?: number
  widthCm?: number
  heightCm?: number
  depthCm?: number
  remainingQuantity?: number
}

export interface FulfillmentLineItem {
  lineItemId: string
  title: string
  quantity: number
  imageSrc?: string
  unitPrice?: number
}

export interface FulfillmentGroup {
  id: string
  displayId: string
  sequenceNumber: number
  trackingNumber?: string
  trackingUrl?: string
  trackingCompany?: string
  shipmentStatus?: string
  status: string
  fulfilledAt?: string
  deliveredAt?: string
  lineItems: FulfillmentLineItem[]
}

export interface PreorderPackingItem {
  lineItemId: string
  quantity?: number
  boxCount: number
  isNested: boolean
}

export interface PreorderShipment {
  id?: string
  batchId?: string | null
  estimatedShipping?: number
  finalShippingPrice?: number
  shippingNotes?: string
  creditAmount?: number
  totalBoxes: number
  totalWeightLb?: number
  invoiceSentAt?: string
  invoiceUrl?: string
  invoicePaidAt?: string
  shopifyDraftOrderId?: string
  warehouseOrigin?: "east" | "west"
  packing?: PreorderPackingItem[]
}

export type OrderFulfillmentSegmentKind =
  | "ship_ready"
  | "preorder_unbatched"
  | "preorder_batch"

export interface OrderFulfillmentSegment {
  key: string
  kind: OrderFulfillmentSegmentKind
  title: string
  batchId?: string | null
  batchName?: string
  lineItems: OrderLineItem[]
  shipment?: PreorderShipment
  fulfillments: FulfillmentGroup[]
  canRequestSecondPayment?: boolean
  secondPaymentStatus?: "pending" | "ready" | "invoiced" | "paid" | string
  groupBalanceDue?: number
  groupShipping?: number
}

export interface SecondPaymentSummary {
  totalBalanceDue: number
  shippingTotal: number
  canRequest: boolean
  status: "pending" | "ready" | "invoiced" | "paid" | string
  configuredGroups: number
  totalGroups: number
}

export function isShipReadyLineItem(item: Pick<OrderLineItem, "type">): boolean {
  return item.type === "ship_ready" || item.type === "ship-ready"
}

export function isPreOrderLineItem(item: Pick<OrderLineItem, "type">): boolean {
  return item.type === "pre_order" || item.type === "pre-order"
}

export function orderLineDisplayUnitPrice(item: OrderLineItem): number {
  const qty = item.quantity || 1
  if (isShipReadyLineItem(item) && item.finalAmount != null && item.finalAmount > 0) {
    return item.finalAmount / qty
  }
  return item.unitPrice
}

export function matchesFulfillmentPanel(
  item: Pick<OrderLineItem, "type">,
  panel: "ship-ready" | "pre-order",
  orderType?: OrderType
): boolean {
  if (panel === "ship-ready") {
    return (
      isShipReadyLineItem(item) ||
      (!item.type && orderType === "ready")
    )
  }
  return (
    isPreOrderLineItem(item) ||
    (!item.type && orderType === "pre-order")
  )
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
  shippingMethod?: string
  preorderShipment?: PreorderShipment
  fulfillmentSegments?: OrderFulfillmentSegment[]
  secondPayment?: SecondPaymentSummary
  fulfillments?: FulfillmentGroup[]
}

import type {
  OrderResponseDto,
  OrderItemDetailDto,
  PreorderShipmentDto,
  OrderFulfillmentSegmentDto,
  OrderLineSliceDto,
  FulfillmentDto,
} from "./dtos"

function mapLineItemDto(
  item: OrderItemDetailDto,
  bucketType: "ship-ready" | "pre-order",
  currency: CurrencyCode
): OrderLineItem {
  return {
    productId: item.id,
    shopifyProductId: item.variant_id,
    title: item.title,
    sku: item.sku || item.variant_id || "",
    quantity: item.quantity,
    unitPrice: parseFloat(item.unit_price) || 0,
    currency,
    fulfillmentStep: item.fulfillment_step,
    itemsReceived: item.items_received,
    itemStatus: item.item_status,
    imageSrc: item.image_src,
    trackingCompany: item.tracking_company,
    trackingLastEvent: item.tracking_last_event,
    trackingNumber: item.tracking_number,
    trackingUrl: item.tracking_url,
    type: bucketType,
    dpAmount: parseFloat(item.dp_amount) || undefined,
    balanceDue: parseFloat(item.balance_due) || undefined,
    finalAmount: parseFloat(item.final_amount) || undefined,
    weightKg: item.weight_kg,
    widthCm: item.width_cm,
    heightCm: item.height_cm,
    depthCm: item.depth_cm,
    remainingQuantity: item.remaining_quantity,
  }
}

function mapShipmentDto(dto: PreorderShipmentDto): PreorderShipment {
  return {
    id: dto.id,
    batchId: dto.batch_id,
    estimatedShipping: dto.estimated_shipping
      ? parseFloat(dto.estimated_shipping)
      : undefined,
    finalShippingPrice: dto.final_shipping_price
      ? parseFloat(dto.final_shipping_price)
      : undefined,
    shippingNotes: dto.shipping_notes,
    creditAmount: dto.credit_amount
      ? parseFloat(dto.credit_amount)
      : undefined,
    totalBoxes: dto.total_boxes ?? 0,
    totalWeightLb: dto.total_weight_lb
      ? parseFloat(dto.total_weight_lb)
      : undefined,
    invoiceSentAt: dto.invoice_sent_at,
    invoiceUrl: dto.invoice_url,
    invoicePaidAt: dto.invoice_paid_at,
    shopifyDraftOrderId: dto.shopify_draft_order_id,
    warehouseOrigin: dto.warehouse_origin,
    packing: dto.packing?.map((p) => ({
      lineItemId: p.line_item_id,
      quantity: p.quantity,
      boxCount: p.box_count,
      isNested: p.is_nested,
    })),
  }
}

function mapFulfillmentDto(f: FulfillmentDto): FulfillmentGroup {
  return {
    id: f.id,
    displayId: f.display_id,
    sequenceNumber: f.sequence_number,
    trackingNumber: f.tracking_number,
    trackingUrl: f.tracking_url,
    trackingCompany: f.tracking_company,
    shipmentStatus: f.shipment_status,
    status: f.status,
    fulfilledAt: f.fulfilled_at,
    deliveredAt: f.delivered_at,
    lineItems: f.line_items.map((li) => ({
      lineItemId: li.line_item_id,
      title: li.title,
      quantity: li.quantity,
      imageSrc: li.image_src,
      unitPrice: li.unit_price ? parseFloat(li.unit_price) : undefined,
    })),
  }
}

function mapSliceToLineItem(
  slice: OrderLineSliceDto,
  currency: CurrencyCode
): OrderLineItem {
  const bucketType: "ship-ready" | "pre-order" =
    slice.type === "ship_ready" || slice.type === "ship-ready"
      ? "ship-ready"
      : "pre-order"
  return {
    productId: slice.line_item_id,
    shopifyProductId: slice.variant_id,
    title: slice.title,
    sku: slice.sku || slice.variant_id || "",
    quantity: slice.quantity,
    unitPrice: parseFloat(slice.unit_price || "0") || 0,
    currency,
    fulfillmentStep: slice.fulfillment_step,
    itemStatus: slice.item_status,
    imageSrc: slice.image_src,
    trackingCompany: slice.tracking_company,
    trackingLastEvent: slice.tracking_last_event,
    trackingNumber: slice.tracking_number,
    trackingUrl: slice.tracking_url,
    type: bucketType,
    dpAmount: slice.dp_amount ? parseFloat(slice.dp_amount) : undefined,
    balanceDue: slice.balance_due ? parseFloat(slice.balance_due) : undefined,
    finalAmount: slice.final_amount
      ? parseFloat(slice.final_amount)
      : undefined,
    weightKg: slice.weight_kg,
    widthCm: slice.width_cm,
    heightCm: slice.height_cm,
    depthCm: slice.depth_cm,
    remainingQuantity: slice.remaining_quantity,
  }
}

function mapSegmentDto(
  dto: OrderFulfillmentSegmentDto,
  currency: CurrencyCode
): OrderFulfillmentSegment {
  return {
    key: dto.key,
    kind: dto.kind,
    title: dto.title,
    batchId: dto.batch_id,
    batchName: dto.batch_name,
    lineItems: (dto.line_slices ?? []).map((s) =>
      mapSliceToLineItem(s, currency)
    ),
    shipment: dto.shipment ? mapShipmentDto(dto.shipment) : undefined,
    fulfillments: (dto.fulfillments ?? []).map(mapFulfillmentDto),
    canRequestSecondPayment: Boolean(dto.can_request_second_payment),
    secondPaymentStatus: dto.second_payment_status,
    groupBalanceDue: dto.group_balance_due
      ? parseFloat(dto.group_balance_due)
      : undefined,
    groupShipping: dto.group_shipping
      ? parseFloat(dto.group_shipping)
      : undefined,
  }
}

export function mapOrderResponseToOrder(dto: OrderResponseDto): Order {
  const currency = (dto.currency as CurrencyCode) ?? "USD"
  const shipReadyItems = (dto.line_items?.ship_ready ?? []).map((item) =>
    mapLineItemDto(item, "ship-ready", currency)
  )
  const preOrderItems = (dto.line_items?.pre_order ?? []).map((item) =>
    mapLineItemDto(item, "pre-order", currency)
  )
  const allItems = [...shipReadyItems, ...preOrderItems]

  const hasShipReady = shipReadyItems.length > 0
  const hasPreOrder = preOrderItems.length > 0
  const type: OrderType =
    hasShipReady && hasPreOrder ? "mixed" : hasPreOrder ? "pre-order" : "ready"

  const fulfillmentSegments = (dto.fulfillment_groups ?? []).map((g) =>
    mapSegmentDto(g, currency)
  )

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
    lineItems: allItems,
    totalBalanceDue: parseFloat(dto.total_balance_due) || 0,
    totalChargedNow: parseFloat(dto.total_charged_now) || 0,
    totalDepositPaid: parseFloat(dto.total_deposit_paid) || 0,
    totalPrice: parseFloat(dto.total_price) || 0,
    totalShipReady: parseFloat(dto.total_ship_ready) || 0,
    shippingMethod: dto.shipping_method,
    preorderShipment: dto.preorder_shipment
      ? mapShipmentDto(dto.preorder_shipment)
      : undefined,
    fulfillmentSegments,
    secondPayment: dto.second_payment
      ? {
          totalBalanceDue: parseFloat(dto.second_payment.total_balance_due) || 0,
          shippingTotal: parseFloat(dto.second_payment.shipping_total) || 0,
          canRequest: Boolean(dto.second_payment.can_request),
          status: dto.second_payment.status,
          configuredGroups: dto.second_payment.configured_groups,
          totalGroups: dto.second_payment.total_groups,
        }
      : undefined,
    currency: (dto.currency as CurrencyCode) ?? "USD",
    paymentStatus: mapFinancialStatus(dto.financial_status),
    fulfillmentStatus: mapFulfillmentStatus(dto.fulfillment_status),
    preOrderState: undefined,
    preOrderInfo: hasPreOrder
      ? {
          dpAmount: parseFloat(dto.total_deposit_paid) || 0,
          remainingAmount: parseFloat(dto.total_balance_due) || 0,
          batch: fulfillmentSegments.find((s) => s.kind === "preorder_batch")
            ?.batchName,
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
    fulfillments: (dto.fulfillments ?? []).map(mapFulfillmentDto),
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

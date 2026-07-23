import type { PaymentStatus, FulfillmentStatus, OrderType } from "./entities"

export interface OrderQueryParams {
  batch?: string
  endDate?: string
  fulfillmentStatus?: FulfillmentStatus | "all"
  paymentStatus?: PaymentStatus | "all"
  search?: string
  startDate?: string
  type?: OrderType | "all"
  page?: number
  limit?: number
}

export interface OrderItemDetailDto {
  amount_charged: string
  balance_due: string
  dp_amount: string
  final_amount: string
  fulfillment_step: number
  id: string
  item_status: string
  items_received: number
  quantity: number
  title: string
  tracking_number?: string
  tracking_url?: string
  image_src?: string
  tracking_company?: string
  tracking_last_event?: string
  type: string
  unit_price: string
  variant_id: string
  sku?: string
  weight_kg?: number
  width_cm?: number
  height_cm?: number
  depth_cm?: number
  remaining_quantity?: number
}

export interface PackingItemDto {
  line_item_id: string
  quantity?: number
  box_count: number
  is_nested: boolean
}

export interface PreorderShipmentDto {
  id?: string
  batch_id?: string | null
  estimated_shipping?: string
  final_shipping_price?: string
  shipping_notes?: string
  credit_amount?: string
  total_boxes: number
  total_weight_lb?: string
  rate_calculated_at?: string
  invoice_sent_at?: string
  invoice_url?: string
  invoice_paid_at?: string
  shopify_draft_order_id?: string
  warehouse_origin?: "east" | "west"
  packing?: PackingItemDto[]
}

export interface CalculatePreorderShippingRequest {
  batch_id?: string | null
  packing: PackingItemDto[]
}

export interface CalculatePreorderShippingResponse {
  estimated_shipping: string
  base_cost?: string
  buffer_amount?: string
  total_boxes: number
  total_weight_lb: string
  packing: PackingItemDto[]
  service_code: string
  currency: string
  batch_id?: string | null
  rate_calculated_at?: string
}

export interface UpdatePreorderShippingRequest {
  batch_id?: string | null
  final_shipping_price: number
  shipping_notes?: string
  packing?: PackingItemDto[]
}

export type FulfillmentSegmentKindDto =
  | "ship_ready"
  | "preorder_unbatched"
  | "preorder_batch"

export interface OrderLineSliceDto {
  line_item_id: string
  variant_id: string
  type: string
  quantity: number
  remaining_quantity?: number
  item_status: string
  fulfillment_step: number
  title: string
  unit_price?: string
  amount_charged?: string
  balance_due?: string
  dp_amount?: string
  final_amount?: string
  image_src?: string
  sku?: string
  weight_kg?: number
  width_cm?: number
  height_cm?: number
  depth_cm?: number
  tracking_number?: string
  tracking_url?: string
  tracking_company?: string
  tracking_last_event?: string
}

export interface OrderFulfillmentSegmentDto {
  key: string
  kind: FulfillmentSegmentKindDto
  title: string
  batch_id?: string | null
  batch_name?: string
  line_slices: OrderLineSliceDto[]
  shipment?: PreorderShipmentDto | null
  fulfillments?: FulfillmentDto[]
  can_request_second_payment?: boolean
  second_payment_status?: string
  group_balance_due?: string | null
  group_shipping?: string | null
}

export interface RequestSecondPaymentRequest {
  batch_id?: string | null
}

export interface SecondPaymentSummaryDto {
  total_balance_due: string
  shipping_total: string
  can_request: boolean
  status: "pending" | "ready" | "invoiced" | "paid" | string
  configured_groups: number
  total_groups: number
}

export interface OrderResponseDto {
  aggregate_status: string
  currency: string
  customer?: {
    email: string
    first_name: string
    id: string
    last_name: string
    phone: string
  } | null
  financial_status: string
  fulfillment_status: string
  id: string
  line_items: {
    pre_order: OrderItemDetailDto[]
    ship_ready: OrderItemDetailDto[]
  }
  order_date?: string
  order_number: string
  shipping_address?: {
    address1: string
    address2?: string
    city: string
    country: string
    first_name: string
    last_name: string
    phone: string
    province: string
    zip: string
  } | null
  shopify_checkout_url: string
  shopify_draft_invoice_url: string
  total_balance_due: string
  total_charged_now: string
  total_deposit_paid: string
  total_price: string
  total_ship_ready: string
  shipping_method?: string
  preorder_shipment?: PreorderShipmentDto
  fulfillment_groups?: OrderFulfillmentSegmentDto[]
  second_payment?: SecondPaymentSummaryDto
  fulfillments?: FulfillmentDto[]
}

export interface FulfillmentLineItemDto {
  line_item_id: string
  title: string
  quantity: number
  image_src?: string
  unit_price?: string
}

export interface FulfillmentDto {
  id: string
  display_id: string
  sequence_number: number
  batch_id?: string | null
  tracking_number?: string
  tracking_url?: string
  tracking_company?: string
  shipment_status?: string
  status: string
  fulfilled_at?: string
  delivered_at?: string
  line_items: FulfillmentLineItemDto[]
}

export interface CreateFulfillmentItemDto {
  line_item_id: string
  quantity: number
}

export interface CreateFulfillmentDto {
  items: CreateFulfillmentItemDto[]
  batch_id?: string | null
  tracking_number: string
  tracking_company: string
  tracking_url?: string
  notify_customer: boolean
}

export interface CreateOrderInput {
  guest_info?: {
    email: string
    first_name: string
    last_name: string
  }
  shipping_method: string
}

export interface UpdateReceivedItemDto {
  item_id: string
  items_received: number
}

export interface UpdateReceivedDto {
  items: UpdateReceivedItemDto[]
}

export interface UpdateStepDto {
  fulfillment_step: number
}

export interface UpdateTrackingDto {
  item_ids: string[]
  tracking_number: string
  tracking_url: string
}

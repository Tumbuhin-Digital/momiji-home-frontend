import type { PaymentStatus, FulfillmentStatus, OrderType } from "./entities"

export interface OrderQueryParams {
  search?: string
  paymentStatus?: PaymentStatus | "all"
  fulfillmentStatus?: FulfillmentStatus | "all"
  type?: OrderType | "all"
  batch?: string
  startDate?: string
  endDate?: string
}

export interface OrderItemDetailDto {
  id: string
  variant_id: string
  title: string
  type: string
  quantity: number
  unit_price: string
  final_amount: string
  dp_amount: string
  amount_charged: string
  balance_due: string
  item_status: string
  fulfillment_step: number
  items_received: number
  tracking_number?: string
  tracking_url?: string
}

export interface OrderResponseDto {
  id: string
  order_number: string
  currency: string
  financial_status: string
  fulfillment_status: string
  aggregate_status: string
  total_price: string
  total_ship_ready: string
  total_charged_now: string
  total_deposit_paid: string
  total_balance_due: string
  shopify_checkout_url: string
  shopify_draft_invoice_url: string
  order_date?: string
  customer?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  } | null
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
  line_items: {
    ship_ready: OrderItemDetailDto[]
    pre_order: OrderItemDetailDto[]
  }
}

export interface CreateOrderInput {
  shipping_method: string
  guest_info?: {
    email: string
    first_name: string
    last_name: string
  }
}

export interface UpdateReceivedDto {
  items_received: number
}

export interface UpdateStepDto {
  fulfillment_step: number
}

export interface UpdateTrackingDto {
  tracking_number: string
  tracking_url: string
}

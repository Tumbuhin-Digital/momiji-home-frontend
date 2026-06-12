import type { PaymentStatus, FulfillmentStatus, OrderType } from "./entities"

export interface OrderQueryParams {
  batch?: string
  endDate?: string
  fulfillmentStatus?: FulfillmentStatus | "all"
  paymentStatus?: PaymentStatus | "all"
  search?: string
  startDate?: string
  type?: OrderType | "all"
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
  type: string
  unit_price: string
  variant_id: string
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
}

export interface CreateOrderInput {
  guest_info?: {
    email: string
    first_name: string
    last_name: string
  }
  shipping_method: string
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

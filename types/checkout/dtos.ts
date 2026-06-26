export interface CheckoutItemDto {
  balance_due: string
  deposit_amount: string
  id: string
  image_src: string
  quantity: number
  subtotal: string
  title: string
  unit_price: string
  variant_id: string
}

export interface CheckoutSummaryDto {
  currency: string
  due_august: {
    preorder_balance: string
    shipping_preorder: string
    total: string
  }
  due_now: {
    preorder_deposit: string
    ship_ready_total: string
    shipping: string
    total: string
  }
  pre_order: {
    balance_subtotal: string
    deposit_subtotal: string
    items: CheckoutItemDto[]
  }
  ship_ready: { items: CheckoutItemDto[]; subtotal: string }
  shipping: { cost: string; estimated_arrival: string; method: string }
}

export interface CheckoutCreateResponseDto {
  checkout_reference?: string
  checkout_url: string
  expires_at?: string
}

export interface CheckoutReleaseInput {
  checkout_reference?: string
}

export interface CheckoutConfirmItemDto {
  amount_charged: string | null
  balance_due: string | null
  item_status: string
  quantity: number
  title: string
  type: string
}

export interface CheckoutConfirmResponseDto {
  currency: string
  customer_email: string
  financial_status: string
  items: CheckoutConfirmItemDto[]
  order_date: string
  order_id: string
  order_number: string
  preorder_shipping_estimate?: string | null
  ship_ready_shipping?: string | null
  total_balance_due: string | null
  total_charged_now: string | null
  total_price: string
}

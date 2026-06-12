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
}

export interface CheckoutConfirmResponseDto {
  order_number: string
  status: string
}

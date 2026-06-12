export interface CheckoutItemDto {
  id: string
  variant_id: string
  title: string
  image_src: string
  quantity: number
  unit_price: string
  subtotal: string
  deposit_amount: string
  balance_due: string
}

export interface CheckoutSummaryDto {
  currency: string
  due_now: {
    ship_ready_total: string
    preorder_deposit: string
    shipping: string
    total: string
  }
  due_august: {
    preorder_balance: string
    shipping_preorder: string
    total: string
  }
  ship_ready: { items: CheckoutItemDto[]; subtotal: string }
  pre_order: {
    items: CheckoutItemDto[]
    deposit_subtotal: string
    balance_subtotal: string
  }
  shipping: { method: string; cost: string; estimated_arrival: string }
}

export interface CheckoutCreateResponseDto {
  checkout_url: string
  checkout_reference?: string
}

export interface CheckoutConfirmResponseDto {
  order_number: string
  status: string
}

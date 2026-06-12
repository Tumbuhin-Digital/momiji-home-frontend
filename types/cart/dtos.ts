export interface CartItemDto {
  balance_due?: string
  deposit_amount?: string
  id: string
  image_src: string
  quantity: number
  subtotal: string
  title: string
  unit_price: string
  variant_id: string
  inventory_quantity: number
}

export interface CartSummaryDto {
  currency: string
  total_balance_due: string
  total_charged_now: string
  total_deposit: string
  total_pre_order: string
  total_ship_ready: string
}

export interface CartResponseDto {
  session_id: string
  ship_ready: CartItemDto[]
  pre_order: CartItemDto[]
  summary: CartSummaryDto
}

export interface AddCartItemInput {
  variant_id: string
  quantity: number
}

export interface UpdateCartItemInput {
  quantity: number
}

export interface CartSessionDto {
  session_id: string
  expires_at: string
}

export interface MergeCartInput {
  guest_session_id: string
}

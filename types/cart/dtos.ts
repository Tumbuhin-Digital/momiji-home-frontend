import type { BatchDepletion } from "@/types/batches"

export interface CartItemDto {
  balance_due?: string
  deposit_amount?: string
  id: string
  image_src: string
  inventory_quantity: number
  is_ltl?: boolean
  quantity: number
  subtotal: string
  title: string
  unit_price: string
  variant_id: string
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
  pre_order: CartItemDto[]
  session_id: string
  ship_ready: CartItemDto[]
  summary: CartSummaryDto
}

export interface AddCartItemInput {
  quantity: number
  variant_id: string
}

export interface UpdateCartItemInput {
  quantity: number
}

export interface CartSessionDto {
  expires_at: string
  session_id: string
}

export interface MergeCartInput {
  guest_session_id: string
}

export interface UpdateVariantQuantityInput {
  accept_batch_depletion?: boolean
  total_quantity: number
  validate_batch?: boolean
  variant_id: string
}

export interface UpdateVariantQuantityResponseDto {
  batch_depletion?: BatchDepletion | null
}

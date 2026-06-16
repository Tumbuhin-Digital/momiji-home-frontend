import { apiClient } from "@/lib/api"

import type {
  AddCartItemInput,
  CartResponseDto,
  CartSessionDto,
  CartSummaryDto,
  MergeCartInput,
  UpdateCartItemInput,
} from "@/types/cart"
import type { BaseResponse } from "@/types/core"

async function getCart(): Promise<CartResponseDto> {
  const response = await apiClient.get<BaseResponse<CartResponseDto>>("/cart")
  if (!response.data) {
    throw new Error("Backend returned empty data")
  }
  return response.data
}

async function clearCart(): Promise<void> {
  await apiClient.del<BaseResponse<void>>("/cart")
}

async function addItem(input: AddCartItemInput): Promise<void> {
  await apiClient.post<BaseResponse<void>>("/cart/items", input)
}

async function removeItem(id: string): Promise<void> {
  await apiClient.del<BaseResponse<void>>(`/cart/items/${id}`)
}

async function updateItem(
  id: string,
  input: UpdateCartItemInput
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(`/cart/items/${id}`, input)
}

async function updateVariantQuantity(
  variantId: string,
  totalQuantity: number
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(`/cart/items/variant`, {
    variant_id: variantId,
    total_quantity: totalQuantity,
  })
}

async function createSession(): Promise<CartSessionDto> {
  const response =
    await apiClient.post<BaseResponse<CartSessionDto>>("/cart/session")
  if (!response.data) {
    throw new Error("Backend returned empty session data")
  }
  return response.data
}

async function mergeSession(input: MergeCartInput): Promise<void> {
  await apiClient.post<BaseResponse<void>>("/cart/merge", input)
}

async function getSummary(): Promise<CartSummaryDto> {
  const response =
    await apiClient.get<BaseResponse<CartSummaryDto>>("/cart/summary")
  if (!response.data) {
    throw new Error("Backend returned empty summary data")
  }
  return response.data
}

export const cartService = {
  addItem,
  clearCart,
  createSession,
  getCart,
  getSummary,
  mergeSession,
  removeItem,
  updateItem,
  updateVariantQuantity,
}

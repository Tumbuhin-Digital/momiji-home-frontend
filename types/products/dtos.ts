export interface VariantBatchSummaryDto {
  active_batch_id?: string | null
  active_batch_name?: string | null
  active_batch_remaining?: number | null
  active_count: number
  has_batches: boolean
  max_batch_orderable_qty?: number | null
  next_batch_name?: string | null
  next_batch_remaining?: number | null
  queued_count: number
  total_count: number
}

export interface VariantDto {
  batch_summary?: VariantBatchSummaryDto
  custom_link_state?: "awaiting_sku" | "linked" | null
  fulfillment_type: "ship_ready" | "pre_order" | "inactive"
  id: string
  image_src: string
  inventory_quantity?: number
  inventory_tracked?: boolean
  retail_price: string
  sku?: string | null
  title: string
  ws_price: string
  weight_kg?: number
  width_cm?: number
  height_cm?: number
  length_cm?: number
  preorder_batch_label?: string | null
  is_ltl?: boolean
}

export interface ProductImageDto {
  alt: string
  id: string
  position: number
  src: string
}

export interface ProductDto {
  body_html: string
  description: string
  expected_ship_date: string
  handle: string
  id: string
  images: ProductImageDto[]
  internal_note?: string | null
  origin?: "shopify_sync" | "custom"
  preorder_batch_label: string
  product_type: string
  shopify_id: string
  status: string
  tags: string
  title: string
  variants: VariantDto[]
  vendor: string
}

import type { ProductCategory } from "./entities"
import type { CurrencyCode } from "@/types/core"

export interface ProductQueryParams {
  category?: ProductCategory | "all"
  fulfillment_type?: "ship_ready" | "pre_order" | "inactive" | "mixed" | "unlisted"
  limit?: number
  page?: number
  search?: string
  sort?: string
  status?: "active" | "unlisted"
}

export type CatalogQueryParams = ProductQueryParams

export interface UpdateInventoryInput {
  quantity: number
  warehouseLocation?: string
}

export interface UpdatePricingInput {
  basePrice?: number
  currency?: CurrencyCode
  markets?: Record<
    CurrencyCode,
    {
      compareAtPrice: number | null
      isAutoCalculated: boolean
      price: number
    }
  >
  retailPrice?: number
  syncToShopify?: boolean
}

export interface UpdateVariantBatchLabelRequest {
  expected_ship_date?: string
  preorder_batch_label: string
}

export interface UpdateVariantCustomTextRequest {
  preorder_batch_label: string
  variant_id: string
}

export interface UpdateProductStatusRequest {
  confirm_batch_cancel?: boolean
  fulfillment_type: string
}

export interface UpdateVariantPriceRequest {
  ws_price?: number
}

export interface UpdateVariantStatusRequest {
  confirm_batch_cancel?: boolean
  fulfillment_type: "ship_ready" | "pre_order" | "inactive"
  variant_id: string
}

export interface UpdateVariantLtlRequest {
  is_ltl: boolean
  variant_id: string
}

export interface LinkCustomVariantSkuRequest {
  sku: string
  variant_id: string
}

export interface CreateCustomVariantRequest {
  rpp_price: number
  title: string
  ws_price: number
}

export interface CreateCustomProductRequest {
  idempotency_key: string
  internal_note?: string
  reference_image?: File
  reference_image_url?: string
  title: string
  variants: CreateCustomVariantRequest[]
}

export interface AddProductVariantsRequest {
  idempotency_key: string
  product_id: string
  variants: CreateCustomVariantRequest[]
}


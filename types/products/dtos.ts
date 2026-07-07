export interface VariantDto {
  fulfillment_type: "ship_ready" | "pre_order" | "inactive"
  id: string
  image_src: string
  inventory_quantity?: number
  retail_price: string
  title: string
  ws_price: string
  weight_kg?: number
  width_cm?: number
  height_cm?: number
  length_cm?: number
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
  fulfillment_type?: "ship_ready" | "pre_order" | "inactive"
  limit?: number
  page?: number
  search?: string
  sort?: string
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

export interface UpdateProductStatusRequest {
  fulfillment_type: string
}

export interface UpdateVariantPriceRequest {
  ws_price?: number
}

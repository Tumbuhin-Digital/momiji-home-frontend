export interface VariantDto {
  id: string
  title: string
  image_src: string
  retail_price: string
  ws_price: string
  fulfillment_type: "ship_ready" | "pre_order"
  inventory_quantity?: number
}

export interface ProductImageDto {
  id: string
  src: string
  alt: string
  position: number
}

export interface ProductDto {
  id: string
  shopify_id: string
  title: string
  description: string
  body_html: string
  handle: string
  vendor: string
  product_type: string
  status: string
  tags: string
  preorder_batch_label: string
  expected_ship_date: string
  images: ProductImageDto[]
  variants: VariantDto[]
}

import type { ProductCategory } from "./entities"
import type { CurrencyCode } from "@/types/core"

export interface ProductQueryParams {
  search?: string
  category?: ProductCategory | "all"
  limit?: number
  page?: number
  sort?: string
  fulfillment_type?: "ship_ready" | "pre_order"
}

export interface UpdateInventoryInput {
  quantity: number
  warehouseLocation?: string
}

export interface UpdatePricingInput {
  basePrice?: number
  retailPrice?: number
  currency?: CurrencyCode
  syncToShopify?: boolean
  markets?: Record<
    CurrencyCode,
    {
      price: number
      compareAtPrice: number | null
      isAutoCalculated: boolean
    }
  >
}

export interface UpdateVariantBatchLabelRequest {
  preorder_batch_label: string
  expected_ship_date?: string
}

export interface UpdateProductStatusRequest {
  fulfillment_type: string
}

export interface UpdateVariantPriceRequest {
  ws_price?: number
}

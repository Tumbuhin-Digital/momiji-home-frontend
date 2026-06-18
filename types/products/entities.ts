import type { CurrencyCode } from "@/types/core"

export type ProductCategory = "pre-order" | "ship-ready" | "inactive"
export type SyncStatus = "synced" | "pending" | "failed"

export interface ProductImage {
  alt: string
  position: number
  src: string
}

export interface Product {
  category: ProductCategory
  description: string
  id: string
  imageUrl: string
  images: ProductImage[]
  inventory: {
    batchAvailable?: number
    batchQuota?: number
    quantity: number
    reserved: number
    syncStatus: SyncStatus
    warehouseLocation: string
  }
  originalId: string
  pricing: {
    basePrice: number
    currency: CurrencyCode
    markets: Record<
      CurrencyCode,
      {
        compareAtPrice: number | null
        isAutoCalculated: boolean
        price: number
      }
    >
    syncToShopify: boolean
  }
  retailPrice?: number
  shopifyProductId: string
  sku: string
  status: string
  title: string
  updatedAt: string
}

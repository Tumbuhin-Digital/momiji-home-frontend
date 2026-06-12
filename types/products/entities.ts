import type { CurrencyCode } from "@/types/core"

export type ProductCategory = "pre-order" | "ship-ready"
export type SyncStatus = "synced" | "pending" | "failed"

export interface Product {
  id: string
  originalId: string
  shopifyProductId: string
  title: string
  sku: string
  description: string
  imageUrl: string
  category: ProductCategory
  status: string
  inventory: {
    quantity: number
    reserved: number
    batchQuota?: number
    batchAvailable?: number
    warehouseLocation: string
    syncStatus: SyncStatus
  }
  pricing: {
    basePrice: number
    currency: CurrencyCode
    syncToShopify: boolean
    markets: Record<
      CurrencyCode,
      {
        price: number
        compareAtPrice: number | null
        isAutoCalculated: boolean
      }
    >
  }
  updatedAt: string
  retailPrice?: number
}

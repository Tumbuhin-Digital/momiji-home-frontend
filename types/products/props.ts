import type { ReactNode } from "react"

import type { Product } from "./entities"

export interface ProductCatalogCardProps {
  product: Product
}

export interface InventoryDepletedModalProps {
  description: ReactNode
  imageUrl?: string
  isOpen: boolean
  isPending?: boolean
  productTitle?: string
  title: string
  onClose: () => void
  onConfirm: () => void
}

export interface ProductCatalogPageClientProps {
  bottomNavLink: string
  bottomNavText: string
  category?: "ship-ready" | "pre-order"
  search?: string
  title: string
}

export interface EditPriceModalProps {
  currentPrice: number
  isOpen: boolean
  productName: string
  variantId: string
  onClose: () => void
}

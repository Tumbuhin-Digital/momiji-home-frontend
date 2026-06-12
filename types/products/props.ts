import type { Product } from "./entities"

export interface ProductCatalogCardProps {
  product: Product
}

export interface InventoryDepletedModalProps {
  isOpen: boolean
  product: Product | { title: string; imageUrl?: string } | null
  onClose: () => void
  onConfirm: () => void
}

export interface ProductCatalogPageClientProps {
  bottomNavLink: string
  bottomNavText: string
  category: "ship-ready" | "pre-order"
  title: string
}

export interface EditPriceModalProps {
  currentPrice: number
  isOpen: boolean
  productName: string
  variantId: string
  onClose: () => void
}

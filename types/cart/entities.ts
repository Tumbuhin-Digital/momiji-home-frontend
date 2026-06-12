import type { Product } from "@/types/products"

export interface CartItem {
  product: Product
  quantity: number
}

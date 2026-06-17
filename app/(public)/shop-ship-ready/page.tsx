import { ProductCatalogPageClient } from "@/components/features/catalog/product-catalog-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ship-Ready Designs",
  description:
    "Browse and order curated inventory ready for immediate dispatch.",
}

export default function ShopInStockPage() {
  return (
    <ProductCatalogPageClient
      category="ship-ready"
      title="Ship-Ready Designs"
      bottomNavLink="/shop-preorder"
      bottomNavText="Shop Pre-Order"
    />
  )
}

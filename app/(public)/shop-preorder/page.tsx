import { ProductCatalogPageClient } from "@/components/features/catalog/product-catalog-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop Pre-Order",
  description:
    "Secure the next generation of Momiji designs with early batch access.",
}

export default function ShopPreorderPage() {
  return (
    <ProductCatalogPageClient
      category="pre-order"
      title="Shop Pre-Order"
      bottomNavLink="/shop-in-stock"
      bottomNavText="Ship-Ready Designs"
    />
  )
}

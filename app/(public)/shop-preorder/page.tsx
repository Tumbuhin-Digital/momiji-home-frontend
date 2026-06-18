import { ProductCatalogPageClient } from "@/components/features/catalog/product-catalog-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pre-Order Designs",
  description:
    "Secure the next generation of Momiji designs with early batch access.",
}

export default function ShopPreorderPage() {
  return (
    <ProductCatalogPageClient
      category="pre-order"
      title="Pre-Order Designs"
      bottomNavLink="/shop-ship-ready"
      bottomNavText="Shop Ship-Ready"
    />
  )
}

import ProductsPageClient from "@/components/features/products/products-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Product Catalog",
  description:
    "Synchronized inventory master and logistics cluster management.",
}

export default function ProductsPage() {
  return <ProductsPageClient />
}

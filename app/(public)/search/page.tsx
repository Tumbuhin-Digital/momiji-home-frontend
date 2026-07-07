import { ProductCatalogPageClient } from "@/components/features/catalog/product-catalog-page-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search Products",
  description: "Find products by keyword across our catalog.",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const rawSearch = params.search
  const search =
    typeof rawSearch === "string"
      ? rawSearch
      : Array.isArray(rawSearch)
        ? rawSearch[0] ?? ""
        : ""

  return (
    <ProductCatalogPageClient
      title={search.trim() ? `Search results for "${search.trim()}"` : "Search"}
      search={search}
      bottomNavLink="/shop-ship-ready"
      bottomNavText="Shop Ship-Ready"
    />
  )
}

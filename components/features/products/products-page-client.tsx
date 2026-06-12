"use client"

import Image from "next/image"
import { Fragment, Suspense, useMemo, useState } from "react"

import { format } from "date-fns"
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Edit2,
  Filter,
  Loader2,
  Search,
} from "lucide-react"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { DimensionsCsvSection } from "@/components/features/products/dimensions-csv-section"
import { EditPriceModal } from "@/components/features/products/edit-price-modal"
import { UpdateBatchModal } from "@/components/features/products/update-batch-modal"

import { useProducts, useUpdateProductStatus } from "@/hooks"
import { formatCurrency } from "@/lib/utils"

import type { Product } from "@/types/products"

function effectivePrice(product: Product) {
  const usdMarket = product.pricing.markets["USD"]
  return usdMarket?.price ?? product.pricing.basePrice
}

const searchParser = parseAsString.withDefault("")
const filterParser = parseAsString.withDefault("all")
const pageParser = parseAsInteger.withDefault(1)

export default function ProductsPageClient() {
  const [search, setSearch] = useQueryState("search", searchParser)
  const [filter, setFilter] = useQueryState("filter", filterParser)
  const [page, setPage] = useQueryState("page", pageParser)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [selectedBatchProduct, setSelectedBatchProduct] =
    useState<Product | null>(null)

  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({})

  const updateProductStatusMutation = useUpdateProductStatus()

  const productsQuery = useProducts({
    search,
    fulfillment_type:
      filter === "ship-ready"
        ? "ship_ready"
        : filter === "pre-order"
          ? "pre_order"
          : undefined,
    page,
    limit: 10,
  })

  const totalPages = productsQuery.data?.totalPages ?? 1

  const rows = useMemo(() => {
    const list = productsQuery.data?.data ?? []
    const groups: Record<
      string,
      {
        shopifyProductId: string
        title: string
        imageUrl: string
        variants: Product[]
      }
    > = {}

    list.forEach((item) => {
      const key = item.shopifyProductId || item.id.split("-")[0]
      if (!groups[key]) {
        let parentTitle = item.title
        if (item.title.includes(" - ")) {
          parentTitle = item.title.split(" - ")[0]
        }
        groups[key] = {
          shopifyProductId: key,
          title: parentTitle,
          imageUrl: item.imageUrl,
          variants: [],
        }
      }
      groups[key].variants.push(item)
    })

    return Object.values(groups)
  }, [productsQuery.data])

  const lastSyncDate = productsQuery.dataUpdatedAt
    ? format(new Date(productsQuery.dataUpdatedAt), "EEEE, hh:mm a")
    : format(new Date(), "EEEE, hh:mm a")

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const handleSearchChange = (val: string) => {
    setSearch(val || null, { throttleMs: 300 })
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setEditModalOpen(true)
  }

  const openBatchModal = (product: Product) => {
    setSelectedBatchProduct(product)
    setBatchModalOpen(true)
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Synchronizing Master Catalog...
          </p>
        </div>
      }
    >
      <main className="flex w-full flex-col gap-6 p-8 lg:p-10">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-medium text-[#2C414A]">
              Product Details
            </h1>
          </div>
          <p className="text-[14px] text-slate-400">
            Last synced: Today, {lastSyncDate} ·{" "}
            {productsQuery.data?.total || 0} products in total
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <DimensionsCsvSection />

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search Product"
                className="h-11 w-full rounded-[8px] border-slate-200 pl-11 text-sm shadow-sm focus-visible:ring-[#8CAEBA]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 gap-2 rounded-[8px] border-slate-200 px-5 text-sm font-medium text-slate-600 shadow-sm"
                >
                  <Filter className="size-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl bg-white shadow-lg"
              >
                <DropdownMenuCheckboxItem
                  checked={filter === "all"}
                  onCheckedChange={() => setFilter("all")}
                >
                  A-Z
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filter === "ship-ready"}
                  onCheckedChange={() => setFilter("ship-ready")}
                >
                  Ship Ready
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filter === "pre-order"}
                  onCheckedChange={() => setFilter("pre-order")}
                >
                  Pre-Order
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Stock: low-high
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Stock: high-low
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] text-slate-600">
                <thead className="bg-[#8CAEBA] text-white">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Stock (Shopify)</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">RPP Price</th>
                    <th className="px-6 py-4 font-medium">WS$ Price</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((group) => {
                    const hasVariants = group.variants.length > 1
                    const isExpanded =
                      !!expandedProducts[group.shopifyProductId]

                    const totalStock = group.variants.reduce(
                      (sum, v) => sum + v.inventory.quantity,
                      0
                    )

                    const minPrice = Math.min(
                      ...group.variants.map((v) => effectivePrice(v))
                    )
                    const maxPrice = Math.max(
                      ...group.variants.map((v) => effectivePrice(v))
                    )
                    const priceRange =
                      minPrice === maxPrice
                        ? formatCurrency(minPrice, "USD ")
                        : `${formatCurrency(minPrice, "USD ")} - ${formatCurrency(maxPrice, "USD ")}`

                    const minRpp = Math.min(
                      ...group.variants.map((v) => v.retailPrice ?? 0)
                    )
                    const maxRpp = Math.max(
                      ...group.variants.map((v) => v.retailPrice ?? 0)
                    )
                    const rppRange =
                      minRpp === maxRpp
                        ? formatCurrency(minRpp, "USD ")
                        : `${formatCurrency(minRpp, "USD ")} - ${formatCurrency(maxRpp, "USD ")}`

                    const singleVariant = !hasVariants
                      ? group.variants[0]
                      : null

                    return (
                      <Fragment key={group.shopifyProductId}>
                        {/* Parent/Main Row */}
                        <tr className="transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {hasVariants && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleExpand(group.shopifyProductId)
                                  }
                                  className="flex size-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="size-4" />
                                  ) : (
                                    <ChevronRight className="size-4" />
                                  )}
                                </button>
                              )}
                              {!hasVariants && <div className="w-6" />}
                              <div className="relative size-12 overflow-hidden rounded-md border border-slate-200 bg-white p-1">
                                {group.imageUrl ? (
                                  <Image
                                    src={group.imageUrl}
                                    alt={group.title}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                    <Boxes className="size-5 text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800">
                                  {group.title}
                                </span>
                                {hasVariants && (
                                  <span className="text-xs text-slate-400">
                                    {group.variants.length} variants
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {totalStock}
                          </td>
                          <td className="px-6 py-4">
                            {singleVariant ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-9 w-40 justify-between rounded-lg border-slate-200 bg-white px-3 text-left text-slate-700 hover:bg-white hover:text-slate-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`size-2.5 rounded-full ${
                                          singleVariant.category ===
                                          "ship-ready"
                                            ? "bg-[#34D399]"
                                            : singleVariant.category ===
                                                "pre-order"
                                              ? "bg-[#F59E0B]"
                                              : "bg-[#EF4444]"
                                        }`}
                                      />
                                      {singleVariant.category === "ship-ready"
                                        ? "Ship Ready"
                                        : singleVariant.category === "pre-order"
                                          ? "Pre-Order"
                                          : "Inactive"}
                                    </div>
                                    <ChevronDown className="size-4 opacity-50" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="w-40 rounded-xl bg-white shadow-lg"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateProductStatusMutation.mutate({
                                        productId: singleVariant.originalId,
                                        input: {
                                          fulfillment_type: "ship_ready",
                                        },
                                      })
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="size-2.5 rounded-full bg-[#34D399]" />
                                      Ship Ready
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateProductStatusMutation.mutate({
                                        productId: singleVariant.originalId,
                                        input: {
                                          fulfillment_type: "pre_order",
                                        },
                                      })
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="size-2.5 rounded-full bg-[#F59E0B]" />
                                      Pre-Order
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem disabled>
                                    <div className="flex items-center gap-2">
                                      <div className="size-2.5 rounded-full bg-[#EF4444]" />
                                      Inactive
                                    </div>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Mixed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">
                            {rppRange}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {priceRange}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {singleVariant && (
                              <div className="flex items-center justify-end gap-2">
                                {singleVariant.category === "pre-order" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 rounded-md border-slate-200 font-medium text-slate-500 hover:text-slate-800"
                                    onClick={() =>
                                      openBatchModal(singleVariant)
                                    }
                                  >
                                    <Boxes className="size-3.5" />
                                    Batch
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-2 rounded-md border-slate-200 font-medium text-slate-500 hover:text-slate-800"
                                  onClick={() => openEditModal(singleVariant)}
                                >
                                  <Edit2 className="size-3.5" />
                                  Edit
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Variant Sub-rows */}
                        {hasVariants &&
                          isExpanded &&
                          group.variants.map((variant) => {
                            const variantName =
                              variant.title.split(" - ")[1] || variant.title
                            return (
                              <tr
                                key={variant.id}
                                className="bg-slate-50/50 hover:bg-slate-100/50"
                              >
                                <td className="px-6 py-3 pl-16">
                                  <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                    <span className="text-sm text-slate-600">
                                      {variantName}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-3 text-slate-600">
                                  {variant.inventory.quantity}
                                </td>
                                <td className="px-6 py-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="h-8 w-40 justify-between rounded-lg border-slate-200 bg-white px-3 text-left text-xs text-slate-700 hover:bg-white hover:text-slate-700"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`size-2 rounded-full ${
                                              variant.category === "ship-ready"
                                                ? "bg-[#34D399]"
                                                : variant.category ===
                                                    "pre-order"
                                                  ? "bg-[#F59E0B]"
                                                  : "bg-[#EF4444]"
                                            }`}
                                          />
                                          {variant.category === "ship-ready"
                                            ? "Ship Ready"
                                            : variant.category === "pre-order"
                                              ? "Pre-Order"
                                              : "Inactive"}
                                        </div>
                                        <ChevronDown className="size-3 opacity-50" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="start"
                                      className="w-40 rounded-xl bg-white text-xs shadow-lg"
                                    >
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateProductStatusMutation.mutate({
                                            productId: variant.originalId,
                                            input: {
                                              fulfillment_type: "ship_ready",
                                            },
                                          })
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="size-2 rounded-full bg-[#34D399]" />
                                          Ship Ready
                                        </div>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateProductStatusMutation.mutate({
                                            productId: variant.originalId,
                                            input: {
                                              fulfillment_type: "pre_order",
                                            },
                                          })
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="size-2 rounded-full bg-[#F59E0B]" />
                                          Pre-Order
                                        </div>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem disabled>
                                        <div className="flex items-center gap-2">
                                          <div className="size-2 rounded-full bg-[#EF4444]" />
                                          Inactive
                                        </div>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                                <td className="px-6 py-3 text-xs font-medium text-slate-500">
                                  {formatCurrency(variant.retailPrice ?? 0)}
                                </td>
                                <td className="px-6 py-3 text-xs font-medium text-slate-600">
                                  {formatCurrency(effectivePrice(variant))}
                                </td>
                                <td className="px-6 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {variant.category === "pre-order" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 gap-1 rounded-md border-slate-200 text-xs font-medium text-slate-500 hover:text-slate-800"
                                        onClick={() => openBatchModal(variant)}
                                      >
                                        <Boxes className="size-3" />
                                        Batch
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 gap-1 rounded-md border-slate-200 text-xs font-medium text-slate-500 hover:text-slate-800"
                                      onClick={() => openEditModal(variant)}
                                    >
                                      <Edit2 className="size-3" />
                                      Edit
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </Fragment>
                    )
                  })}

                  {rows.length === 0 && !productsQuery.isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12">
                        <Empty className="border-none py-12">
                          <EmptyMedia variant="icon">
                            <Search className="size-5 text-slate-400" />
                          </EmptyMedia>
                          <EmptyHeader>
                            <EmptyTitle className="text-slate-800">
                              No products found
                            </EmptyTitle>
                            <EmptyDescription>
                              No products found matching your search.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage(page - 1)
                      }}
                      className={
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                          isActive={page === p}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages) setPage(page + 1)
                      }}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>

      {selectedProduct && (
        <EditPriceModal
          key={`price-${selectedProduct.sku}`}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          productName={selectedProduct.title}
          currentPrice={effectivePrice(selectedProduct)}
          variantId={selectedProduct.sku}
        />
      )}

      {selectedBatchProduct && (
        <UpdateBatchModal
          key={`batch-${selectedBatchProduct.sku}`}
          isOpen={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          productName={selectedBatchProduct.title}
          productId={selectedBatchProduct.originalId}
        />
      )}
    </Suspense>
  )
}

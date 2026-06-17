"use client"

import Image from "next/image"
import { Fragment, Suspense, useMemo, useState } from "react"

import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Edit2,
  ListFilter,
  Loader2,
  RotateCcw,
  Search,
  Upload,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { DimensionsCsvModal } from "@/components/features/products/dimensions-csv-modal"
import { EditPriceModal } from "@/components/features/products/edit-price-modal"
import { ProductTableSkeleton } from "@/components/features/products/product-table-skeleton"

import { useProducts, useUpdateProductStatus } from "@/hooks"
import { formatCurrency, formatLastSynced } from "@/lib/utils"

import type { Product } from "@/types/products"

function effectivePrice(product: Product) {
  const usdMarket = product.pricing.markets["USD"]
  return usdMarket?.price ?? product.pricing.basePrice
}

const searchParser = parseAsString.withDefault("")
const filterParser = parseAsString.withDefault("all")
const sortParser = parseAsString.withDefault("")
const pageParser = parseAsInteger.withDefault(1)

export default function ProductsPageClient() {
  const [search, setSearch] = useQueryState("search", searchParser)
  const [filter, setFilter] = useQueryState("filter", filterParser)
  const [sort, setSort] = useQueryState("sort", sortParser)
  const [page, setPage] = useQueryState("page", pageParser)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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
    sort: sort || undefined,
    page,
    limit: 10,
  })

  const totalPages = productsQuery.data?.totalPages ?? 1

  const isFilterActive = search !== "" || filter !== "all" || sort !== ""

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

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const handleSearchChange = (val: string) => {
    setSearch(val || null, { throttleMs: 300 })
    setPage(1)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setEditModalOpen(true)
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
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[32px] font-medium text-neutral-800">
              Product Details
            </h1>
            <p className="text-lg text-neutral-400">
              {formatLastSynced(new Date())} · {productsQuery.data?.total || 0}{" "}
              products in total
            </p>
          </div>
          <Button
            type="button"
            size="xl"
            onClick={() => setCsvModalOpen(true)}
            className="h-13! w-full sm:w-fit"
          >
            <Upload className="size-4" />
            Upload Dimension
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <InputGroup className="h-11 flex-1 rounded-[8px] border-primary shadow-sm has-[input:focus-visible]:border-primary/20 has-[input:focus-visible]:ring-primary/20">
              <InputGroupAddon>
                <div className="flex size-6 items-center justify-center gap-2 rounded-full bg-primary/20">
                  <Search
                    className="size-3 text-primary"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                </div>
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search Product"
                className="text-sm"
              />
            </InputGroup>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11! gap-2 rounded-[6px] border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-600"
                  >
                    <ListFilter className="size-5" strokeWidth={1.5} /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-xl bg-white shadow-lg"
                >
                  <DropdownMenuCheckboxItem
                    checked={sort === "name_asc"}
                    onCheckedChange={() => {
                      setSort(sort === "name_asc" ? "" : "name_asc")
                      setPage(1)
                    }}
                  >
                    A-Z
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === "ship-ready"}
                    onCheckedChange={() => {
                      setFilter(filter === "ship-ready" ? "all" : "ship-ready")
                      setPage(1)
                    }}
                  >
                    Ship Ready
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === "pre-order"}
                    onCheckedChange={() => {
                      setFilter(filter === "pre-order" ? "all" : "pre-order")
                      setPage(1)
                    }}
                  >
                    Pre-Order
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === "stock_asc"}
                    onCheckedChange={() => {
                      setSort(sort === "stock_asc" ? "" : "stock_asc")
                      setPage(1)
                    }}
                  >
                    Stock: low-high
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === "stock_desc"}
                    onCheckedChange={() => {
                      setSort(sort === "stock_desc" ? "" : "stock_desc")
                      setPage(1)
                    }}
                  >
                    Stock: high-low
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isFilterActive && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSearch(null)
                    setFilter("all")
                    setSort(null)
                    setPage(1)
                  }}
                  className="size-11! gap-2 rounded-[6px] border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-600"
                >
                  <RotateCcw className="size-5" strokeWidth={1.5} />
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-t-[8px] border border-primary/50 bg-white">
            <div className="h-[calc(100vh-280px)] overflow-x-auto overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="sticky top-0 z-10 bg-primary text-white">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Stock (Shopify)</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">RPP Price</th>
                    <th className="px-6 py-4 font-medium">WS$ Price</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/50">
                  {productsQuery.isLoading && <ProductTableSkeleton />}
                  {!productsQuery.isLoading &&
                    rows.map((group) => {
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
                          ? `${formatCurrency(minPrice)} USD`
                          : `${formatCurrency(minPrice)} USD - ${formatCurrency(maxPrice)} USD`

                      const minRpp = Math.min(
                        ...group.variants.map((v) => v.retailPrice ?? 0)
                      )
                      const maxRpp = Math.max(
                        ...group.variants.map((v) => v.retailPrice ?? 0)
                      )
                      const rppRange =
                        minRpp === maxRpp
                          ? `${formatCurrency(minRpp)} USD`
                          : `${formatCurrency(minRpp)} USD - ${formatCurrency(maxRpp)} USD`

                      const isUniformCategory = group.variants.every(
                        (v) => v.category === group.variants[0].category
                      )
                      const groupCategory = isUniformCategory
                        ? group.variants[0].category
                        : "mixed"

                      const singleVariant = !hasVariants
                        ? group.variants[0]
                        : null

                      return (
                        <Fragment key={group.shopifyProductId}>
                          {/* Parent/Main Row */}
                          <tr className="transition-colors hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-start gap-4">
                                <div className="relative size-12 overflow-hidden rounded-md border border-slate-200 bg-linear-to-b from-white via-white to-black/5">
                                  {group.imageUrl ? (
                                    <Image
                                      src={group.imageUrl}
                                      alt={group.title}
                                      fill
                                      className="relative block aspect-square h-auto max-w-full align-middle transition-opacity duration-200"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-b from-white via-white to-black/5">
                                      <Boxes
                                        className="size-4 text-neutral-400"
                                        strokeWidth={0.5}
                                      />
                                      <span className="text-[8px] font-light text-neutral-400">
                                        No Image
                                      </span>
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
                                {hasVariants && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleExpand(group.shopifyProductId)
                                    }
                                    className="flex size-6 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="size-4" />
                                    ) : (
                                      <ChevronRight className="size-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">
                              {totalStock}
                            </td>
                            <td className="px-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-10! w-40 justify-between border-black/20 bg-white px-3 text-left text-slate-700 hover:bg-white hover:text-slate-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`size-2.5 rounded-full ${
                                          groupCategory === "ship-ready"
                                            ? "bg-[#29CE2D]"
                                            : groupCategory === "pre-order"
                                              ? "bg-[#FF8D28]"
                                              : "bg-[#FF383C]"
                                        }`}
                                      />
                                      <span className="capitalize">
                                        {groupCategory.replace("-", " ")}
                                      </span>
                                    </div>
                                    <ChevronDown className="size-4 text-slate-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="w-40 rounded-xl bg-white shadow-lg"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateProductStatusMutation.mutate({
                                        productId: group.variants[0].originalId,
                                        input: {
                                          fulfillment_type: "ship_ready",
                                        },
                                      })
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="size-2.5 rounded-full bg-[#29CE2D]" />
                                      Ship Ready
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateProductStatusMutation.mutate({
                                        productId: group.variants[0].originalId,
                                        input: {
                                          fulfillment_type: "pre_order",
                                        },
                                      })
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="size-2.5 rounded-full bg-[#FF8D28]" />
                                      Pre-Order
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem disabled>
                                    <div className="flex items-center gap-2">
                                      <div className="size-2.5 rounded-full bg-[#FF383C]" />
                                      Inactive
                                    </div>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-600/60">
                              {rppRange}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">
                              {priceRange}
                            </td>
                            <td className="px-6 py-4">
                              {singleVariant && (
                                <div className="flex items-center justify-start gap-2">
                                  <Button
                                    variant="outline"
                                    size="xl"
                                    className="border-primary text-primary"
                                    onClick={() => openEditModal(singleVariant)}
                                  >
                                    <Edit2 className="size-4" />
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
                                <tr key={variant.id}>
                                  <td className="px-6 py-4 pl-12">
                                    <div className="flex items-center gap-3">
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                      <span className="text-sm text-slate-600">
                                        {variantName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-600">
                                    {variant.inventory.quantity}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex h-10 w-40 items-center justify-start gap-2 rounded-lg border border-black/20 bg-white px-3 font-medium text-slate-700 hover:bg-white hover:text-slate-700">
                                      <div
                                        className={`size-2 rounded-full ${
                                          variant.category === "ship-ready"
                                            ? "bg-[#29CE2D]"
                                            : variant.category === "pre-order"
                                              ? "bg-[#FF8D28]"
                                              : "bg-[#FF383C]"
                                        }`}
                                      />
                                      <span className="capitalize">
                                        {variant.category.replace("-", " ")}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-600/60">
                                    {formatCurrency(variant.retailPrice ?? 0)}{" "}
                                    USD
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-800">
                                    {formatCurrency(effectivePrice(variant))}{" "}
                                    USD
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-start gap-2">
                                      <Button
                                        variant="outline"
                                        size="xl"
                                        className="border-primary text-primary"
                                        onClick={() => openEditModal(variant)}
                                      >
                                        <Edit2 className="size-4" />
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
                      <td colSpan={6} className="p-0">
                        <div className="flex h-[calc(100vh-360px)] items-center justify-center">
                          <Empty className="gap-4 border-none">
                            <EmptyMedia variant="icon" className="mb-0">
                              <Search className="size-5 text-primary" />
                            </EmptyMedia>
                            <EmptyHeader>
                              <EmptyTitle>No products found</EmptyTitle>
                              <EmptyDescription>
                                No products found matching your search.
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div>
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
      </div>

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

      <DimensionsCsvModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
      />
    </Suspense>
  )
}

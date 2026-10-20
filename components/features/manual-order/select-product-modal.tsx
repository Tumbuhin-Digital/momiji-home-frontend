"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Check, Search, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useInfiniteProducts } from "@/hooks/use-products"
import { formatVariantSpecs } from "@/lib/units"
import { cn, formatCurrency } from "@/lib/utils"

import type { Product } from "@/types/products"

interface SelectProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (products: Product[]) => void
}

export function SelectProductModal({
  open,
  onOpenChange,
  onSave,
}: SelectProductModalProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim())
  // Keep the full product so selections survive search changes and paging.
  const [selected, setSelected] = useState<Map<string, Product>>(new Map())
  const listRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data: productsPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(
    {
      search: debouncedSearch || undefined,
      sort: "name_asc",
      limit: 50,
    },
    { enabled: open }
  )

  const products = useMemo(() => {
    const items = productsPages?.pages.flatMap((page) => page.data) ?? []
    return items.filter((p) => p.category !== "inactive")
  }, [productsPages])

  useEffect(() => {
    const root = listRef.current
    const target = sentinelRef.current
    if (!root || !target || !open) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { root, threshold: 0.1, rootMargin: "80px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage, products.length])

  const toggle = (product: Product) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(product.id)) next.delete(product.id)
      else next.set(product.id, product)
      return next
    })
  }

  const handleSave = () => {
    onSave(Array.from(selected.values()))
    setSelected(new Map())
    setSearch("")
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelected(new Map())
      setSearch("")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-full max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-alternate">
            Select Product
          </DialogTitle>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-md bg-muted"
              />
            }
          >
            <XIcon className="size-4" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Product"
              className="pl-9"
            />
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[1fr_88px_100px_100px] bg-[#5B7C8A] px-4 py-2 text-sm font-medium text-white">
              <span>Product</span>
              <span className="text-center">Available</span>
              <span className="text-right">RPP Price</span>
              <span className="text-right">WS$ Price</span>
            </div>

            <div ref={listRef} className="max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="size-6" />
                </div>
              ) : products.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No products found
                </p>
              ) : (
                products.map((product) => {
                  const isSelected = selected.has(product.id)
                  const dims = formatVariantSpecs(product)
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggle(product)}
                      className={cn(
                        "grid w-full grid-cols-[1fr_88px_100px_100px] items-center border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60",
                        isSelected && "bg-muted/80"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded border",
                            isSelected
                              ? "border-[#5B7C8A] bg-[#5B7C8A] text-white"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {isSelected ? <Check className="size-3" /> : null}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl || "/placeholder.png"}
                          alt=""
                          className="size-12 rounded object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-alternate">
                            {product.title}
                          </p>
                          {dims ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {dims}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <span className="text-center text-sm text-alternate">
                        {product.inventory.quantity}
                      </span>
                      <span className="text-right text-sm text-muted-foreground">
                        {formatCurrency(product.retailPrice ?? 0)}
                      </span>
                      <span className="text-right text-sm font-medium text-alternate">
                        {formatCurrency(product.pricing.basePrice)}
                      </span>
                    </button>
                  )
                })
              )}
              <div
                ref={sentinelRef}
                className="flex h-8 items-center justify-center"
                aria-hidden
              >
                {isFetchingNextPage ? <Spinner className="size-4" /> : null}
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="h-12 w-full bg-[#5B7C8A] text-white hover:bg-[#4d6a76]"
            disabled={selected.size === 0}
            onClick={handleSave}
          >
            Save product{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

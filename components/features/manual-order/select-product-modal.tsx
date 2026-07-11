"use client"

import { useMemo, useState } from "react"

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

import { useProducts } from "@/hooks/use-products"
import { formatProductDims } from "@/lib/manual-order/summary"
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const productsQuery = useProducts(
    {
      search: search || undefined,
      sort: "name_asc",
      page: 1,
      limit: 50,
    },
    { enabled: open }
  )

  const products = useMemo(() => {
    const items = productsQuery.data?.data ?? []
    return items.filter((p) => p.category !== "inactive")
  }, [productsQuery.data])

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.has(p.id)),
    [products, selectedIds]
  )

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    onSave(selectedProducts)
    setSelectedIds(new Set())
    setSearch("")
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedIds(new Set())
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

            <div className="max-h-[420px] overflow-y-auto">
              {productsQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="size-6" />
                </div>
              ) : products.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No products found
                </p>
              ) : (
                products.map((product) => {
                  const selected = selectedIds.has(product.id)
                  const dims = formatProductDims(product)
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggle(product.id)}
                      className={cn(
                        "grid w-full grid-cols-[1fr_88px_100px_100px] items-center border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60",
                        selected && "bg-muted/80"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded border",
                            selected
                              ? "border-[#5B7C8A] bg-[#5B7C8A] text-white"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {selected ? <Check className="size-3" /> : null}
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
            </div>
          </div>

          <Button
            type="button"
            className="h-12 w-full bg-[#5B7C8A] text-white hover:bg-[#4d6a76]"
            disabled={selectedIds.size === 0}
            onClick={handleSave}
          >
            Save product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

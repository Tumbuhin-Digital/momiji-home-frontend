"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Search, Trash2 } from "lucide-react"
import { toastManager } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import {
  useAddProductVariants,
  useCreateCustomProduct,
  useInfiniteProducts,
  useProductById,
  useProductVariants,
} from "@/hooks/use-products"
import { cn, formatCurrency } from "@/lib/utils"

import type { Product } from "@/types/products"

type ModalMode = "create" | "edit"

type VariantRow = {
  key: string
  title: string
  rppPrice: string
  wsPrice: string
}

function newRow(title = "", rppPrice = "", wsPrice = ""): VariantRow {
  return {
    key: crypto.randomUUID(),
    title,
    rppPrice,
    wsPrice,
  }
}

function parsePrice(value: string): number | null {
  const n = parseFloat(value)
  if (Number.isNaN(n) || n < 0) return null
  return n
}

type AddCustomProductModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function AddCustomProductModal({
  isOpen,
  onClose,
}: AddCustomProductModalProps) {
  const createMutation = useCreateCustomProduct()
  const addVariantsMutation = useAddProductVariants()

  const [mode, setMode] = useState<ModalMode>("create")
  const [title, setTitle] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [rppPrice, setRppPrice] = useState("")
  const [wsPrice, setWsPrice] = useState("")
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [idempotencyKey, setIdempotencyKey] = useState("")

  const [productSearch, setProductSearch] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  )
  const [pickerOpen, setPickerOpen] = useState(true)
  const productListRef = useRef<HTMLDivElement>(null)
  const productListSentinelRef = useRef<HTMLDivElement>(null)

  const hasVariants = variants.length > 0
  const isPending = createMutation.isPending || addVariantsMutation.isPending

  const {
    data: productsPages,
    isLoading: productsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(
    {
      search: productSearch.trim() || undefined,
      sort: "name_asc",
      limit: 50,
    },
    { enabled: isOpen && mode === "edit" && pickerOpen }
  )

  const productOptions = useMemo(() => {
    const items = productsPages?.pages.flatMap((page) => page.data) ?? []
    const byOriginal = new Map<
      string,
      { id: string; title: string; status: string; origin?: string }
    >()
    for (const item of items) {
      const id = item.originalId
      if (!id || byOriginal.has(id)) continue
      // Prefer product title without variant suffix for Default Title rows.
      const baseTitle =
        item.title.includes(" - ") && !item.title.endsWith(" - Default Title")
          ? item.title.split(" - ")[0]
          : item.title.replace(/ - Default Title$/, "")
      byOriginal.set(id, {
        id,
        title: baseTitle,
        status: item.status,
        origin: item.origin,
      })
    }
    return Array.from(byOriginal.values())
  }, [productsPages])

  useEffect(() => {
    const root = productListRef.current
    const target = productListSentinelRef.current
    if (!root || !target || !pickerOpen || mode !== "edit") return

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
  }, [
    pickerOpen,
    mode,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    productOptions.length,
  ])

  const selectedDetailQuery = useProductById(selectedProductId ?? "", {
    enabled: Boolean(selectedProductId) && mode === "edit",
  })
  const selectedVariantsQuery = useProductVariants(selectedProductId ?? "", {
    enabled: Boolean(selectedProductId) && mode === "edit",
  })

  const existingVariants: Product[] = selectedVariantsQuery.data ?? []

  const handleModeChange = (next: ModalMode) => {
    if (isPending || next === mode) return
    setMode(next)
    if (next === "edit") {
      setProductSearch("")
      setSelectedProductId(null)
      setPickerOpen(true)
      setVariants([newRow("Variant 1")])
      setIdempotencyKey(crypto.randomUUID())
    } else {
      setSelectedProductId(null)
      setProductSearch("")
      setPickerOpen(true)
      setTitle("")
      setInternalNote("")
      setImageFile(null)
      setRppPrice("")
      setWsPrice("")
      setVariants([])
      setIdempotencyKey(crypto.randomUUID())
    }
  }

  const [prevOpen, setPrevOpen] = useState(isOpen)
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen)
    if (isOpen) {
      setMode("create")
      setTitle("")
      setInternalNote("")
      setImageFile(null)
      setRppPrice("")
      setWsPrice("")
      setVariants([])
      setIdempotencyKey(crypto.randomUUID())
      setProductSearch("")
      setSelectedProductId(null)
      setPickerOpen(true)
    }
  }

  const updateVariant = (
    key: string,
    field: keyof Omit<VariantRow, "key">,
    value: string
  ) => {
    setVariants((rows) =>
      rows.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    )
  }

  const handleAddVariant = () => {
    setVariants((rows) => {
      if (mode === "create" && rows.length === 0) {
        return [newRow("Variant 1", rppPrice, wsPrice)]
      }
      return [...rows, newRow(`Variant ${rows.length + 1}`)]
    })
  }

  const handleRemoveVariant = (key: string) => {
    if (mode === "edit" && variants.length <= 1) {
      return
    }
    const removed = variants.find((r) => r.key === key)
    const next = variants.filter((r) => r.key !== key)
    if (
      mode === "create" &&
      variants.length === 1 &&
      next.length === 0 &&
      removed
    ) {
      setRppPrice(removed.rppPrice)
      setWsPrice(removed.wsPrice)
    }
    setVariants(next)
  }

  const parseVariantRows = (
    rows: VariantRow[]
  ): { title: string; rpp_price: number; ws_price: number }[] | null => {
    const parsed: { title: string; rpp_price: number; ws_price: number }[] = []
    for (const row of rows) {
      const rpp = parsePrice(row.rppPrice)
      const ws = parsePrice(row.wsPrice)
      if (!row.title.trim()) {
        toastManager.add({
          title: "Error",
          description: "Each variant needs a title",
          type: "error",
        })
        return null
      }
      if (rpp === null || ws === null) {
        toastManager.add({
          title: "Error",
          description: "Enter valid RPP and WS$ prices for every variant",
          type: "error",
        })
        return null
      }
      parsed.push({
        title: row.title.trim(),
        rpp_price: rpp,
        ws_price: ws,
      })
    }
    return parsed
  }

  const handleSaveCreate = async () => {
    if (!title.trim()) {
      toastManager.add({
        title: "Error",
        description: "Product name is required",
        type: "error",
      })
      return
    }

    let parsed: { title: string; rpp_price: number; ws_price: number }[] = []

    if (!hasVariants) {
      const rpp = parsePrice(rppPrice)
      const ws = parsePrice(wsPrice)
      if (rpp === null || ws === null) {
        toastManager.add({
          title: "Error",
          description: "Enter valid RPP and WS$ prices",
          type: "error",
        })
        return
      }
      parsed = [{ title: "Default Title", rpp_price: rpp, ws_price: ws }]
    } else {
      const rows = parseVariantRows(variants)
      if (!rows) return
      parsed = rows
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        internal_note: internalNote.trim() || undefined,
        idempotency_key: idempotencyKey,
        variants: parsed,
        reference_image: imageFile ?? undefined,
      })
      toastManager.add({
        title: "Custom product created",
        description: "The product is UNLISTED in Shopify and ready in Momiji.",
        type: "success",
      })
      onClose()
    } catch {
      // toast handled by mutation/api client when present
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedProductId) {
      toastManager.add({
        title: "Error",
        description: "Select a product to edit",
        type: "error",
      })
      return
    }
    const parsed = parseVariantRows(variants)
    if (!parsed) return

    const existingTitles = new Set(
      existingVariants.map((v) => {
        if (v.title.includes(" - ")) {
          return v.title.split(" - ").slice(1).join(" - ").trim().toLowerCase()
        }
        return "default title"
      })
    )
    for (const row of parsed) {
      if (existingTitles.has(row.title.toLowerCase())) {
        toastManager.add({
          title: "Error",
          description: `Variant title already exists: ${row.title}`,
          type: "error",
        })
        return
      }
    }

    try {
      await addVariantsMutation.mutateAsync({
        product_id: selectedProductId,
        idempotency_key: idempotencyKey,
        variants: parsed,
      })
      toastManager.add({
        title: "Variants added",
        description:
          "New variants synced to Shopify. Product status was not changed.",
        type: "success",
      })
      onClose()
    } catch {
      // toast handled by mutation/api client when present
    }
  }

  const handleSave = () => {
    if (mode === "create") {
      void handleSaveCreate()
    } else {
      void handleSaveEdit()
    }
  }

  const selectedTitle =
    selectedDetailQuery.data?.title ??
    productOptions.find((p) => p.id === selectedProductId)?.title ??
    ""

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent
        className="max-h-[90vh] sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4">
          <DialogTitle className="tracking-wide sm:text-[22px]">
            {mode === "create" ? "Add Custom Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            {mode === "create"
              ? "Creates an UNLISTED Shopify product. Add variants only if the product has options; otherwise prices stay on the product."
              : "Add variants to an existing product. Shopify status stays unchanged (ACTIVE stays active, custom stays UNLISTED)."}
          </DialogDescription>

          <div className="mt-3 flex gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleModeChange("create")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "create"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Add custom product
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleModeChange("edit")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "edit"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Edit product
            </button>
          </div>
        </DialogHeader>

        <DialogPanel className="min-h-0 flex-1 space-y-5 p-6!">
          {mode === "create" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="custom-product-name">Product name</Label>
                <Input
                  id="custom-product-name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Product name"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-product-image">
                  Reference image (optional)
                </Label>
                <Input
                  id="custom-product-image"
                  type="file"
                  accept="image/*"
                  disabled={isPending}
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-product-note">
                  Internal note (optional)
                </Label>
                <Textarea
                  id="custom-product-note"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Momiji-only note — not sent to Shopify"
                  disabled={isPending}
                  rows={2}
                />
              </div>

              {!hasVariants && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="custom-product-rpp">RPP (USD)</Label>
                    <Input
                      id="custom-product-rpp"
                      value={rppPrice}
                      onChange={(e) => setRppPrice(e.target.value)}
                      disabled={isPending}
                      inputMode="decimal"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-product-ws">WS$ (USD)</Label>
                    <Input
                      id="custom-product-ws"
                      value={wsPrice}
                      onChange={(e) => setWsPrice(e.target.value)}
                      disabled={isPending}
                      inputMode="decimal"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-5">
              {selectedProductId && !pickerOpen ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                        Selected product
                      </p>
                      <p className="truncate font-medium text-slate-900">
                        {selectedTitle || "…"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      disabled={isPending}
                      onClick={() => {
                        setPickerOpen(true)
                        setProductSearch("")
                      }}
                    >
                      Change
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-600">Existing variants</Label>
                    {selectedVariantsQuery.isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Spinner className="size-4" />
                        Loading variants…
                      </div>
                    ) : existingVariants.length === 0 ? (
                      <p className="text-sm text-slate-500">No variants yet</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200">
                        {existingVariants.map((v) => {
                          const variantLabel = v.title.includes(" - ")
                            ? v.title.split(" - ").slice(1).join(" - ")
                            : "Default Title"
                          return (
                            <li
                              key={v.id}
                              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                            >
                              <span className="min-w-0 truncate">
                                {variantLabel}
                              </span>
                              <span className="shrink-0 text-slate-500">
                                {formatCurrency(v.retailPrice ?? 0)} /{" "}
                                {formatCurrency(v.pricing.basePrice)}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edit-product-search">Select product</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="edit-product-search"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product"
                      className="pl-9"
                      disabled={isPending}
                    />
                  </div>
                  <div
                    ref={productListRef}
                    className="max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white"
                  >
                    {productsLoading ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-sm text-slate-500">
                        <Spinner className="size-4" />
                        Loading…
                      </div>
                    ) : productOptions.length === 0 ? (
                      <p className="p-3 text-sm text-slate-500">
                        No products found
                      </p>
                    ) : (
                      <>
                        {productOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setSelectedProductId(option.id)
                              setPickerOpen(false)
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-slate-50",
                              selectedProductId === option.id && "bg-slate-100"
                            )}
                          >
                            <span className="min-w-0 truncate font-medium text-slate-900">
                              {option.title}
                            </span>
                            <span className="shrink-0 text-xs text-slate-500 uppercase">
                              {option.status}
                            </span>
                          </button>
                        ))}
                        <div
                          ref={productListSentinelRef}
                          className="flex h-8 items-center justify-center"
                          aria-hidden
                        >
                          {isFetchingNextPage ? (
                            <Spinner className="size-4 text-slate-400" />
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                  {selectedProductId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="self-start"
                      disabled={isPending}
                      onClick={() => setPickerOpen(false)}
                    >
                      Keep current selection
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {(mode === "create" || (selectedProductId && !pickerOpen)) && (
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <Label>{mode === "edit" ? "New variants" : "Variants"}</Label>
                  {mode === "create" && !hasVariants && (
                    <p className="text-xs text-slate-500">
                      Optional — leave empty to use product prices above.
                    </p>
                  )}
                  {mode === "edit" && (
                    <p className="text-xs text-slate-500">
                      Only new variants are sent to Shopify.
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={isPending || variants.length >= 100}
                  onClick={handleAddVariant}
                >
                  <Plus className="size-4" />
                  Add variant
                </Button>
              </div>

              {hasVariants && (
                <div className="space-y-3">
                  {variants.map((row, index) => (
                    <div
                      key={row.key}
                      className="grid gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                    >
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">
                          Variant title
                        </Label>
                        <Input
                          value={row.title}
                          onChange={(e) =>
                            updateVariant(row.key, "title", e.target.value)
                          }
                          disabled={isPending}
                          placeholder={`Variant ${index + 1}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">
                          RPP (USD)
                        </Label>
                        <Input
                          value={row.rppPrice}
                          onChange={(e) =>
                            updateVariant(row.key, "rppPrice", e.target.value)
                          }
                          disabled={isPending}
                          inputMode="decimal"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500">
                          WS$ (USD)
                        </Label>
                        <Input
                          value={row.wsPrice}
                          onChange={(e) =>
                            updateVariant(row.key, "wsPrice", e.target.value)
                          }
                          disabled={isPending}
                          inputMode="decimal"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={
                            isPending ||
                            (mode === "edit" && variants.length <= 1)
                          }
                          onClick={() => handleRemoveVariant(row.key)}
                          aria-label="Remove variant"
                        >
                          <Trash2 className="size-4 text-slate-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogPanel>

        <DialogFooter className="shrink-0">
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={
              isPending ||
              (mode === "edit" && (!selectedProductId || pickerOpen))
            }
          >
            {isPending ? <Spinner className="size-4" /> : null}
            {mode === "create" ? "Create product" : "Add variants"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

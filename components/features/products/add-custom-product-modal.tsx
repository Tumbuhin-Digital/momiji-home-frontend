"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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

import { useCreateCustomProduct } from "@/hooks/use-products"

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
  const [title, setTitle] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [rppPrice, setRppPrice] = useState("")
  const [wsPrice, setWsPrice] = useState("")
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [idempotencyKey, setIdempotencyKey] = useState("")

  const hasVariants = variants.length > 0

  useEffect(() => {
    if (isOpen) {
      setTitle("")
      setInternalNote("")
      setImageFile(null)
      setRppPrice("")
      setWsPrice("")
      setVariants([])
      setIdempotencyKey(crypto.randomUUID())
    }
  }, [isOpen])

  const isPending = createMutation.isPending

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
      if (rows.length === 0) {
        // First variant: seed prices from product-level fields.
        return [newRow("Variant 1", rppPrice, wsPrice)]
      }
      return [...rows, newRow(`Variant ${rows.length + 1}`)]
    })
  }

  const handleRemoveVariant = (key: string) => {
    const removed = variants.find((r) => r.key === key)
    const next = variants.filter((r) => r.key !== key)
    if (variants.length === 1 && next.length === 0 && removed) {
      setRppPrice(removed.rppPrice)
      setWsPrice(removed.wsPrice)
    }
    setVariants(next)
  }

  const handleSave = async () => {
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
      for (const row of variants) {
        const rpp = parsePrice(row.rppPrice)
        const ws = parsePrice(row.wsPrice)
        if (!row.title.trim()) {
          toastManager.add({
            title: "Error",
            description: "Each variant needs a title",
            type: "error",
          })
          return
        }
        if (rpp === null || ws === null) {
          toastManager.add({
            title: "Error",
            description: "Enter valid RPP and WS$ prices for every variant",
            type: "error",
          })
          return
        }
        parsed.push({
          title: row.title.trim(),
          rpp_price: rpp,
          ws_price: ws,
        })
      }
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogPanel className="flex flex-col gap-4 p-4!">
          <DialogHeader className="p-0">
            <DialogTitle className="tracking-wide sm:text-[22px]">
              Add Custom Product
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              Creates an UNLISTED Shopify product. Add variants only if the
              product has options; otherwise prices stay on the product.
            </DialogDescription>
          </DialogHeader>
        </DialogPanel>

        <div className="space-y-4 px-6 pb-2">
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
            <Label htmlFor="custom-product-note">Internal note (optional)</Label>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Label>Variants</Label>
                {!hasVariants && (
                  <p className="text-xs text-slate-500">
                    Optional — leave empty to use product prices above.
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                    className="grid gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]"
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
                      <Label className="text-xs text-slate-500">RPP (USD)</Label>
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
                      <Label className="text-xs text-slate-500">WS$ (USD)</Label>
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
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
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
        </div>

        <DialogFooter className="gap-2 px-6 pb-6">
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? <Spinner className="size-4" /> : null}
            Create product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

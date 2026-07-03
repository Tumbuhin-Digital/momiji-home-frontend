"use client"

import { useMemo, useState } from "react"

import { AlertCircle, Package, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

import {
  useCalculatePreorderShipping,
  useUpdatePreorderShipping,
} from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"
import { warehouseLabel } from "@/lib/warehouse"

import type { PreorderCalculateShippingModalProps } from "@/types/orders"
import type {
  OrderLineItem,
  PreorderPackingItem,
} from "@/types/orders/entities"

const KG_TO_LB = 2.20462

function defaultPacking(items: OrderLineItem[]): PreorderPackingItem[] {
  return items.map((item) => ({
    lineItemId: item.productId,
    boxCount: item.quantity,
    isNested: false,
  }))
}

function mergePacking(
  items: OrderLineItem[],
  saved?: PreorderPackingItem[]
): PreorderPackingItem[] {
  if (!saved?.length) return defaultPacking(items)
  const savedMap = new Map(saved.map((p) => [p.lineItemId, p]))
  return items.map((item) => {
    const existing = savedMap.get(item.productId)
    if (existing) return existing
    return {
      lineItemId: item.productId,
      boxCount: item.quantity,
      isNested: false,
    }
  })
}

function formatDims(item: OrderLineItem): string {
  const cmToIn = 0.393701
  const l = (item.depthCm ?? 0) * cmToIn
  const w = (item.widthCm ?? 0) * cmToIn
  const h = (item.heightCm ?? 0) * cmToIn
  if (!l && !w && !h) return "—"
  return `${l.toFixed(0)}×${w.toFixed(0)}×${h.toFixed(0)} in`
}

function itemWeightLb(item: OrderLineItem): number {
  const kg = item.weightKg ?? 0
  return kg > 0 ? kg * KG_TO_LB : 1
}

function formatAddress(order: PreorderCalculateShippingModalProps["order"]) {
  const addr = order.shippingAddress
  if (!addr) return "-"
  return `${addr.address1}${addr.address2 ? `, ${addr.address2}` : ""}, ${addr.city}, ${addr.province} ${addr.zip}`
}

function initialFinalPrice(
  shipment: PreorderCalculateShippingModalProps["order"]["preorderShipment"]
): string {
  if (shipment?.finalShippingPrice != null) {
    return shipment.finalShippingPrice.toFixed(2)
  }
  if (shipment?.estimatedShipping != null) {
    return shipment.estimatedShipping.toFixed(2)
  }
  return ""
}

export function PreorderCalculateShippingModal({
  order,
  items,
  isOpen,
  onClose,
  mode = "initial",
  onSaved,
  onShippingConfigured,
}: PreorderCalculateShippingModalProps) {
  const calculateShipping = useCalculatePreorderShipping(order.id)
  const updateShipping = useUpdatePreorderShipping(order.id)

  const [packing, setPacking] = useState<PreorderPackingItem[]>(() =>
    mergePacking(items, order.preorderShipment?.packing)
  )

  const shipment = order.preorderShipment
  const warehouseOrigin = shipment?.warehouseOrigin ?? "east"
  const checkoutEstimate = shipment?.estimatedShipping
  const [finalPrice, setFinalPrice] = useState<string>(() =>
    initialFinalPrice(order.preorderShipment)
  )
  const [notes, setNotes] = useState(
    () => order.preorderShipment?.shippingNotes ?? ""
  )
  const [currentEstimate, setCurrentEstimate] = useState<number | undefined>()
  const [saveError, setSaveError] = useState<string | undefined>()

  const totalBoxes = useMemo(
    () => packing.reduce((sum, p) => sum + (p.isNested ? 0 : p.boxCount), 0),
    [packing]
  )

  const totalWeightLb = useMemo(() => {
    return packing.reduce((sum, p) => {
      if (p.isNested || p.boxCount <= 0) return sum
      const item = items.find((i) => i.productId === p.lineItemId)
      if (!item) return sum
      return sum + itemWeightLb(item) * p.boxCount
    }, 0)
  }, [packing, items])

  const creditAmount = useMemo(() => {
    if (checkoutEstimate == null) return 0
    const final = parseFloat(finalPrice)
    if (Number.isNaN(final)) return 0
    return Math.max(0, checkoutEstimate - final)
  }, [checkoutEstimate, finalPrice])

  const hasCheckoutEstimate = checkoutEstimate != null
  const hasCurrentEstimate = currentEstimate != null
  const canSave =
    hasCheckoutEstimate ||
    hasCurrentEstimate ||
    shipment?.finalShippingPrice != null

  const toggleNested = (lineItemId: string, checked: boolean) => {
    setPacking((prev) =>
      prev.map((p) => {
        if (p.lineItemId !== lineItemId) return p
        const item = items.find((i) => i.productId === lineItemId)
        return {
          ...p,
          isNested: !checked,
          boxCount: checked ? (item?.quantity ?? 1) : 0,
        }
      })
    )
  }

  const handleCalculate = async () => {
    setSaveError(undefined)
    try {
      const res = await calculateShipping.mutateAsync({
        packing: packing.map((p) => ({
          line_item_id: p.lineItemId,
          box_count: p.boxCount,
          is_nested: p.isNested,
        })),
      })
      const est = parseFloat(res.estimated_shipping)
      setCurrentEstimate(est)
      setPacking(
        res.packing.map((p) => ({
          lineItemId: p.line_item_id,
          boxCount: p.box_count,
          isNested: p.is_nested,
        }))
      )
      // Pre-fill final price from current ShipStation rate; admin can edit before save.
      if (!shipment?.finalShippingPrice) {
        setFinalPrice(res.estimated_shipping)
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to calculate shipping"
      )
    }
  }

  const handleSaveAndClose = async () => {
    setSaveError(undefined)
    if (!canSave) {
      setSaveError(
        "A checkout estimate or calculated rate is required before saving the final price."
      )
      return
    }
    const price = parseFloat(finalPrice)
    if (Number.isNaN(price) || price < 0) {
      setSaveError("Enter a valid final shipping price.")
      return
    }
    try {
      await updateShipping.mutateAsync({
        final_shipping_price: price,
        shipping_notes: notes,
        packing: packing.map((p) => ({
          line_item_id: p.lineItemId,
          box_count: p.boxCount,
          is_nested: p.isNested,
        })),
      })
      onSaved?.()
      onShippingConfigured?.()
      onClose()
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save shipping"
      )
    }
  }

  const isBusy = calculateShipping.isPending || updateShipping.isPending
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isBusy && onClose()}
    >
      <DialogContent
        className="flex max-h-[92vh] w-[95vw] max-w-2xl flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 border-b border-[#EBEBEB] px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="text-left">
              <DialogTitle className="text-2xl font-bold text-[#2C3E50]">
                #{order.orderNumber}
              </DialogTitle>
              <p className="text-sm text-[#7F8C8D]">
                {totalItems} items · pre-order
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded bg-[#F1F2F6] hover:bg-[#E1E2E6]"
              onClick={onClose}
              disabled={isBusy}
            >
              <XIcon className="size-5 text-[#7F8C8D]" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="rounded-xl border border-[#EBEBEB] bg-[#F4F1ED] p-4">
            <p className="mb-3 text-sm font-semibold text-[#4A4A4A]">
              Customer Information
            </p>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#959595]">Name</p>
                <p className="text-[#4A4A4A]">{order.customer?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-[#959595]">Email</p>
                <p className="text-[#4A4A4A]">{order.customer?.email || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[#959595]">Address</p>
                <p className="text-[#4A4A4A]">{formatAddress(order)}</p>
              </div>
            </div>
          </div>

          {/* LCL placeholder — out of scope */}
          <div
            data-placeholder="lcl-detection"
            className="hidden"
            aria-hidden
          />

          <div className="rounded-xl border border-[#D9E2E8] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                Box Packing
              </h4>
              <span className="text-xs text-slate-500">
                Untick items nested inside another box
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item) => {
                const pack = packing.find(
                  (p) => p.lineItemId === item.productId
                )
                const isNested = pack?.isNested ?? false
                const boxCount = pack?.boxCount ?? item.quantity

                return (
                  <label
                    key={item.productId}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                      isNested
                        ? "border-orange-200 bg-orange-50/50 opacity-75"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-primary"
                      checked={!isNested}
                      onChange={(e) =>
                        toggleNested(item.productId, e.target.checked)
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`font-medium text-slate-800 ${isNested ? "line-through" : ""}`}
                        >
                          {item.title}
                        </p>
                        {isNested && (
                          <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                            NESTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.sku || item.shopifyProductId} · {formatDims(item)}{" "}
                        · {itemWeightLb(item).toFixed(2)} lb · qty{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="font-semibold text-slate-700">
                        {isNested
                          ? "0 box"
                          : `${boxCount} box${boxCount !== 1 ? "es" : ""}`}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>
                <Package className="mr-1 inline size-4" />
                {totalBoxes} boxes total
              </span>
              <span>{totalWeightLb.toFixed(2)} lb total weight</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#D9E2E8] bg-white p-4">
            <h4 className="mb-3 text-xs font-bold tracking-wide text-slate-500 uppercase">
              Shipping
            </h4>

            <p className="mb-3 text-xs text-slate-500">
              Checkout estimate is from order time. Recalculate for the current
              rate with your packing plan. Labels are purchased manually via
              Unishippers — enter the final shipping price below.
            </p>

            <div className="mb-4 flex justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-600">Warehouse origin</span>
              <span className="font-medium text-slate-900">
                {warehouseLabel(warehouseOrigin)}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mb-4 border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
              onClick={handleCalculate}
              disabled={isBusy || totalBoxes === 0}
            >
              {calculateShipping.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Calculating...
                </>
              ) : (
                "Calculate Shipping"
              )}
            </Button>

            {(hasCheckoutEstimate || hasCurrentEstimate) && (
              <div className="mb-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                {hasCheckoutEstimate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">
                      Checkout estimate (UPS Ground)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(checkoutEstimate!)} USD
                    </span>
                  </div>
                )}
                {hasCurrentEstimate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">
                      Current estimate (ShipStation, {totalBoxes} boxes)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(currentEstimate!)} USD
                    </span>
                  </div>
                )}
                {finalPrice && !Number.isNaN(parseFloat(finalPrice)) && (
                  <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                    <span className="text-slate-600">
                      Final shipping (admin)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(parseFloat(finalPrice))} USD
                    </span>
                  </div>
                )}
                {creditAmount > 0 && (
                  <div className="flex justify-between gap-4 text-emerald-700">
                    <span>Credit reference (manual)</span>
                    <span className="font-medium">
                      {formatCurrency(creditAmount)} USD
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="modal-final-shipping-price"
                  className="text-sm font-medium"
                >
                  Final shipping price
                </Label>
                <Input
                  id="modal-final-shipping-price"
                  type="text"
                  inputMode="decimal"
                  value={finalPrice}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setFinalPrice(val)
                    }
                  }}
                  placeholder="0.00"
                  className="**:data-[slot=input]:h-11 **:data-[slot=input]:px-3 **:data-[slot=input]:text-lg **:data-[slot=input]:leading-11 **:data-[slot=input]:font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modal-shipping-notes">
                  Shipping notes (customer-facing)
                </Label>
                <Textarea
                  id="modal-shipping-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional notes for invoice and customer email"
                />
              </div>
            </div>

            {creditAmount > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  Checkout estimate exceeds final by{" "}
                  {formatCurrency(creditAmount)} — issue credit manually if
                  applicable. No auto-refund.
                </span>
              </div>
            )}

            {saveError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {saveError}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-[#EBEBEB] px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveAndClose}
            disabled={isBusy || !canSave}
          >
            {updateShipping.isPending ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : mode === "edit" ? (
              "Save changes"
            ) : (
              "Save shipping & close"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

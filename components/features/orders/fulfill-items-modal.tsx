"use client"

import { useEffect, useMemo, useState } from "react"

import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

import {
  buildTrackingUrl,
  CARRIER_OPTIONS,
} from "@/lib/utils/tracking-url"
import { cn, formatCurrency } from "@/lib/utils"

import type { OrderLineItem } from "@/types/orders/entities"
import type { CreateFulfillmentDto } from "@/types/orders/dtos"

export interface FulfillItemSelection {
  lineItemId: string
  quantity: number
  selected: boolean
}

interface FulfillItemsModalProps {
  items: OrderLineItem[]
  isOpen: boolean
  onClose: () => void
  onConfirm: (body: CreateFulfillmentDto) => void
  isConfirming: boolean
}

export function FulfillItemsModal({
  items,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: FulfillItemsModalProps) {
  const [selections, setSelections] = useState<FulfillItemSelection[]>([])
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState("UPS")
  const [customUrl, setCustomUrl] = useState("")
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  const unfulfilledItems = useMemo(
    () =>
      items.filter((item) => {
        const remaining = item.remainingQuantity ?? item.quantity
        const hasTracking = Boolean(
          item.trackingNumber?.trim() || item.trackingUrl?.trim()
        )
        if (remaining <= 0) return false
        // Hide items that already have tracking and nothing was fulfilled yet
        if (hasTracking && remaining >= item.quantity) return false
        return true
      }),
    [items]
  )

  useEffect(() => {
    if (isOpen) {
      setSelections(
        unfulfilledItems.map((item) => ({
          lineItemId: item.productId,
          quantity: item.remainingQuantity ?? item.quantity,
          selected: unfulfilledItems.length === 1,
        }))
      )
      setTrackingNumber("")
      setCarrier("UPS")
      setCustomUrl("")
      setNotifyCustomer(true)
    }
  }, [isOpen, unfulfilledItems])

  const trackingUrlPreview = useMemo(() => {
    if (carrier === "Custom") return customUrl
    return buildTrackingUrl(carrier, trackingNumber)
  }, [carrier, trackingNumber, customUrl])

  const handleClose = () => {
    if (!isConfirming) onClose()
  }

  const selectedItems = selections.filter((s) => s.selected && s.quantity > 0)

  const isDisabled =
    selectedItems.length === 0 || !trackingNumber.trim()

  const handleConfirm = () => {
    onConfirm({
      items: selectedItems.map((s) => ({
        line_item_id: s.lineItemId,
        quantity: s.quantity,
      })),
      tracking_number: trackingNumber.trim(),
      tracking_company: carrier,
      tracking_url: carrier === "Custom" ? customUrl : trackingUrlPreview,
      notify_customer: notifyCustomer,
    })
  }

  const updateSelection = (
    lineItemId: string,
    patch: Partial<FulfillItemSelection>
  ) => {
    setSelections((prev) =>
      prev.map((s) => (s.lineItemId === lineItemId ? { ...s, ...patch } : s))
    )
  }

  if (unfulfilledItems.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogPanel className="flex flex-col items-center gap-4 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Package className="size-8 text-primary" />
          </div>
          <DialogHeader className="w-full p-0 text-center">
            <DialogTitle className="tracking-wide sm:text-[22px]">
              Mark as Fulfilled
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              Select items and enter tracking details for this shipment.
            </DialogDescription>
          </DialogHeader>
        </DialogPanel>

        <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto px-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral-700">Items</Label>
            {selections.map((sel) => {
              const item = unfulfilledItems.find(
                (i) => i.productId === sel.lineItemId
              )
              if (!item) return null
              const maxQty = item.remainingQuantity ?? item.quantity
              return (
                <div
                  key={sel.lineItemId}
                  role="button"
                  tabIndex={isConfirming ? -1 : 0}
                  onClick={() => {
                    if (isConfirming) return
                    updateSelection(sel.lineItemId, {
                      selected: !sel.selected,
                    })
                  }}
                  onKeyDown={(e) => {
                    if (isConfirming) return
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      updateSelection(sel.lineItemId, {
                        selected: !sel.selected,
                      })
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    sel.selected
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <Checkbox
                    checked={sel.selected}
                    className="pointer-events-none"
                    disabled={isConfirming}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(item.unitPrice)} · max {maxQty}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 text-sm"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={sel.quantity}
                      onChange={(e) => {
                        const v = Math.min(
                          maxQty,
                          Math.max(1, parseInt(e.target.value, 10) || 1)
                        )
                        updateSelection(sel.lineItemId, { quantity: v })
                      }}
                      className="h-9 w-14 text-center"
                      disabled={isConfirming || !sel.selected}
                    />
                    <span className="text-slate-500">of {maxQty}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fulfill-tracking-number">Tracking number</Label>
            <Input
              id="fulfill-tracking-number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1ZK1120X0315553659"
              disabled={isConfirming}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Shipping carrier</Label>
            <Select
              value={carrier}
              onValueChange={(v) => setCarrier(v || "UPS")}
              disabled={isConfirming}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARRIER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {carrier === "Custom" && (
            <div className="space-y-1.5">
              <Label htmlFor="fulfill-custom-url">Tracking URL (optional)</Label>
              <Input
                id="fulfill-custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
                disabled={isConfirming}
                className="h-11"
              />
            </div>
          )}

          {trackingUrlPreview && carrier !== "Custom" && (
            <p className="text-xs text-slate-500">
              Tracking URL:{" "}
              <a
                href={trackingUrlPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {trackingUrlPreview}
              </a>
            </p>
          )}

          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={notifyCustomer}
              onCheckedChange={(c) => setNotifyCustomer(c === true)}
              disabled={isConfirming}
            />
            <span className="text-sm text-slate-700">
              Send a notification to the customer
            </span>
          </label>
        </div>

        <DialogFooter
          variant="bare"
          className="w-full flex-col-reverse gap-3 px-6 pb-6 sm:flex-col-reverse"
        >
          <DialogClose
            render={
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleClose}
                disabled={isConfirming}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            disabled={isConfirming || isDisabled}
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Fulfilling...
              </>
            ) : (
              "Mark as fulfilled"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

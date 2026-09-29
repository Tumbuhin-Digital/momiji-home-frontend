"use client"

import { useEffect, useMemo, useState } from "react"

import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastManager } from "@/components/ui/toast"

import { SelectProductModal } from "@/components/features/manual-order/select-product-modal"

import { useUpdateDraftOrderItems } from "@/hooks/use-orders"
import { useShippingRates } from "@/hooks/use-shipping"
import { formatCurrency } from "@/lib/utils"

import type { WebsiteDraftOrderDetailDto } from "@/types/orders"
import type { Product } from "@/types/products"

interface EditLine {
  variantId: string
  title: string
  quantity: number
  fulfillmentType: "ship_ready" | "pre_order"
}

function linesFromDraft(draft: WebsiteDraftOrderDetailDto): EditLine[] {
  return draft.line_items
    .filter(
      (line) => line.kind !== "shipping_deposit" && Boolean(line.variant_id)
    )
    .map((line) => ({
      variantId: line.variant_id as string,
      title: line.title,
      quantity: line.quantity,
      fulfillmentType: line.kind === "pre_order" ? "pre_order" : "ship_ready",
    }))
}

export function DraftOrderEditPanel({
  draft,
  onCancel,
  onSaved,
}: {
  draft: WebsiteDraftOrderDetailDto
  onCancel: () => void
  onSaved: () => void
}) {
  const [lines, setLines] = useState<EditLine[]>(() => linesFromDraft(draft))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [shippingMethod, setShippingMethod] = useState(
    draft.shipping_method || ""
  )
  const updateDraft = useUpdateDraftOrderItems()

  const shipReady = lines.filter((line) => line.fulfillmentType === "ship_ready")
  const preOrder = lines.filter((line) => line.fulfillmentType === "pre_order")
  const treatAllAsPreOrder =
    draft.ship_together && shipReady.length > 0 && preOrder.length > 0

  const address = draft.shipping_address
  const ratesAddressReady = Boolean(address?.zip && address.country)
  const shipReadyLineItems = shipReady.map((line) => ({
    variant_id: line.variantId,
    quantity: line.quantity,
  }))
  const preOrderLineItems = (
    treatAllAsPreOrder ? [...shipReady, ...preOrder] : preOrder
  ).map((line) => ({
    variant_id: line.variantId,
    quantity: line.quantity,
  }))

  const ratesAddress = {
    zip: address?.zip || "",
    country: address?.country || "",
    state: address?.province || "",
    city: address?.city || "",
    address1: address?.address1 || "",
  }

  const shipReadyRatesQuery = useShippingRates(
    {
      ...ratesAddress,
      segment: "ship_ready",
      line_items: shipReadyLineItems,
    },
    {
      enabled:
        ratesAddressReady && !treatAllAsPreOrder && shipReadyLineItems.length > 0,
    }
  )
  const preOrderRatesQuery = useShippingRates(
    {
      ...ratesAddress,
      segment: "pre_order",
      origin: draft.origin === "west" ? "west" : "east",
      line_items: preOrderLineItems,
    },
    {
      enabled: ratesAddressReady && preOrderLineItems.length > 0,
    }
  )

  const rates = useMemo(() => {
    if (treatAllAsPreOrder || preOrder.length > 0) {
      return preOrderRatesQuery.data ?? []
    }
    return shipReadyRatesQuery.data ?? []
  }, [
    treatAllAsPreOrder,
    preOrder.length,
    preOrderRatesQuery.data,
    shipReadyRatesQuery.data,
  ])

  const ratesLoading =
    shipReadyRatesQuery.isFetching || preOrderRatesQuery.isFetching

  useEffect(() => {
    if (rates.length === 0) return
    if (rates.some((rate) => rate.serviceCode === shippingMethod)) return
    setShippingMethod(rates[0].serviceCode)
  }, [rates, shippingMethod])

  const needsShipping = preOrder.length > 0 || treatAllAsPreOrder

  const addProducts = (products: Product[]) => {
    setLines((prev) => {
      const next = [...prev]
      for (const product of products) {
        if (product.category === "inactive" || !product.sku) continue
        const fulfillmentType =
          product.category === "pre-order" ? "pre_order" : "ship_ready"
        const existing = next.findIndex((line) => line.variantId === product.sku)
        if (existing >= 0) {
          next[existing] = {
            ...next[existing],
            quantity: next[existing].quantity + 1,
          }
        } else {
          next.push({
            variantId: product.sku,
            title: product.title,
            quantity: 1,
            fulfillmentType,
          })
        }
      }
      return next
    })
  }

  const save = async () => {
    if (lines.length === 0) {
      toastManager.add({
        title: "Products required",
        description: "Keep at least one product on the draft.",
        type: "warning",
      })
      return
    }
    if (needsShipping && !shippingMethod) {
      toastManager.add({
        title: "Shipping required",
        description: "Select a shipping method for pre-order items.",
        type: "warning",
      })
      return
    }

    try {
      await updateDraft.mutateAsync({
        draftOrderId: draft.id,
        shippingMethod: shippingMethod || undefined,
        lineItems: lines.map((line) => ({
          variantId: line.variantId,
          quantity: line.quantity,
        })),
      })
      toastManager.add({
        title: "Draft updated",
        description: "Products and shipping were saved.",
        type: "success",
      })
      onSaved()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Shopify could not update this draft."
      toastManager.add({
        title: "Update failed",
        description: message,
        type: "error",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#EBEBEB]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F2EDE4]">
            <tr>
              <th className="px-4 py-3 font-medium text-black">ITEM</th>
              <th className="px-4 py-3 font-medium text-black">QTY</th>
              <th className="px-4 py-3 font-medium text-black" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {lines.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                  No products. Add at least one.
                </td>
              </tr>
            )}
            {lines.map((line) => (
              <tr key={line.variantId}>
                <td className="px-4 py-3 text-black">
                  <p className="font-medium">{line.title}</p>
                  <p className="text-xs text-neutral-400">
                    {line.fulfillmentType === "pre_order" ? "Pre-order" : "Ship ready"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min={1}
                    className="h-9 w-20"
                    value={line.quantity}
                    onChange={(event) => {
                      const quantity = Number(event.target.value)
                      if (!Number.isFinite(quantity) || quantity < 1) return
                      setLines((prev) =>
                        prev.map((item) =>
                          item.variantId === line.variantId
                            ? { ...item, quantity }
                            : item
                        )
                      )
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${line.title}`}
                    onClick={() =>
                      setLines((prev) =>
                        prev.filter((item) => item.variantId !== line.variantId)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
        Add product
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-[#4A4A4A] uppercase">
          Shipping
        </p>
        {!ratesAddressReady ? (
          <p className="text-sm text-neutral-500">
            This draft has no shipping address, so rates cannot be calculated.
          </p>
        ) : ratesLoading ? (
          <p className="text-sm text-neutral-500">Calculating shipping...</p>
        ) : rates.length === 0 ? (
          <p className="text-sm text-neutral-500">No shipping rates for this cart.</p>
        ) : (
          <div className="space-y-2">
            {rates.map((rate) => (
              <label
                key={rate.serviceCode}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-[#EBEBEB] px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="draft-shipping-method"
                    checked={shippingMethod === rate.serviceCode}
                    onChange={() => setShippingMethod(rate.serviceCode)}
                  />
                  {rate.label}
                </span>
                <span>{formatCurrency(rate.cost)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          className="bg-[#5B7C8A] text-white hover:bg-[#4d6a76]"
          disabled={updateDraft.isPending || lines.length === 0}
          onClick={save}
        >
          {updateDraft.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <SelectProductModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSave={addProducts}
      />
    </div>
  )
}

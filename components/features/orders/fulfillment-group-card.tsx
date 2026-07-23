"use client"

import { MoreHorizontal, Package, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { formatCurrency } from "@/lib/utils"

import type { FulfillmentGroup } from "@/types/orders/entities"

interface FulfillmentGroupCardProps {
  fulfillment: FulfillmentGroup
  shippingCost?: number
  onMarkDelivered?: (fulfillmentId: string) => void
  isMarkingDelivered?: boolean
}

export function FulfillmentGroupCard({
  fulfillment,
  shippingCost,
  onMarkDelivered,
  isMarkingDelivered = false,
}: FulfillmentGroupCardProps) {
  const isDelivered = fulfillment.status === "delivered"
  const itemsSubtotal = fulfillment.lineItems.reduce((sum, li) => {
    if (li.unitPrice == null) return sum
    return sum + li.unitPrice * li.quantity
  }, 0)
  const hasItemsSubtotal = fulfillment.lineItems.some(
    (li) => li.unitPrice != null
  )

  return (
    <div className="rounded-xl border border-[#D9E2E8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#D9E2E8] bg-[#F8FAFB] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            <Package className="size-3.5" />
            {isDelivered ? "Delivered" : "Fulfilled"}
          </span>
          {fulfillment.trackingCompany && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              {fulfillment.trackingCompany}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">
            {fulfillment.displayId}
          </span>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100"
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 border-b border-[#D9E2E8] px-4 py-3">
        {fulfillment.deliveredAt && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Truck className="size-4 shrink-0" />
            <span>
              Delivered ·{" "}
              {new Date(fulfillment.deliveredAt).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        {fulfillment.trackingNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="size-4 shrink-0 text-slate-500" />
            <span className="text-slate-600">
              {fulfillment.trackingCompany || "Carrier"} tracking:{" "}
              {fulfillment.trackingUrl ? (
                <a
                  href={fulfillment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0052CC] hover:underline"
                >
                  {fulfillment.trackingNumber}
                </a>
              ) : (
                <span className="font-medium">{fulfillment.trackingNumber}</span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {fulfillment.lineItems.map((li) => (
          <div
            key={`${fulfillment.id}-${li.lineItemId}`}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
              {li.imageSrc ? (
                <img
                  src={li.imageSrc}
                  alt={li.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="size-5 text-slate-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {li.title}
              </p>
            </div>
            <div className="text-right text-sm">
              {li.unitPrice != null && (
                <p className="text-slate-600">
                  {formatCurrency(li.unitPrice)} × {li.quantity}
                </p>
              )}
              {li.unitPrice != null && (
                <p className="font-medium text-slate-800">
                  {formatCurrency(li.unitPrice * li.quantity)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {(hasItemsSubtotal || shippingCost != null) && (
        <div className="space-y-2 border-t border-[#D9E2E8] bg-[#F8FAFB] px-4 py-3">
          {hasItemsSubtotal && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Items subtotal</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(itemsSubtotal)}
              </span>
            </div>
          )}
          {shippingCost != null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Final shipping</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(shippingCost)} USD
              </span>
            </div>
          )}
        </div>
      )}

      {!isDelivered && onMarkDelivered && (
        <div className="flex justify-end border-t border-[#D9E2E8] px-4 py-3">
          <Button
            size="sm"
            onClick={() => onMarkDelivered(fulfillment.id)}
            disabled={isMarkingDelivered}
          >
            {isMarkingDelivered ? (
              <>
                <Spinner className="mr-2 size-4" />
                Updating...
              </>
            ) : (
              "Mark as delivered"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

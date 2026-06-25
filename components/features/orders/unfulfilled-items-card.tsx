"use client"

import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"

import { formatCurrency } from "@/lib/utils"

import type { OrderLineItem } from "@/types/orders/entities"

interface UnfulfilledItemsCardProps {
  items: OrderLineItem[]
  onMarkFulfilled: () => void
  disabled?: boolean
}

export function UnfulfilledItemsCard({
  items,
  onMarkFulfilled,
  disabled = false,
}: UnfulfilledItemsCardProps) {
  const unfulfilled = items.filter((item) => {
    const remaining = item.remainingQuantity ?? item.quantity
    return remaining > 0
  })

  if (unfulfilled.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50">
      <div className="flex items-center justify-between border-b border-amber-200/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <Package className="size-3.5" />
            Unfulfilled
          </span>
          <span className="text-xs text-amber-700">Shop location</span>
        </div>
      </div>

      <div className="divide-y divide-amber-100">
        {unfulfilled.map((item) => {
          const remaining = item.remainingQuantity ?? item.quantity
          return (
            <div
              key={item.productId}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
                {item.imageSrc ? (
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="size-5 text-amber-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500">
                  {remaining} of {item.quantity} remaining
                </p>
              </div>
              <div className="text-right text-sm text-slate-600">
                {formatCurrency(item.unitPrice)} × {remaining}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end border-t border-amber-200/80 px-4 py-3">
        <Button
          size="sm"
          className="bg-slate-900 text-white hover:bg-slate-800"
          onClick={onMarkFulfilled}
          disabled={disabled}
        >
          Mark as fulfilled
        </Button>
      </div>
    </div>
  )
}

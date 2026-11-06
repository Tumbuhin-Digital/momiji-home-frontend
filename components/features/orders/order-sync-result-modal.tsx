"use client"

import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { OrderSyncResultDto } from "@/types/orders"

interface OrderSyncResultModalProps {
  result: OrderSyncResultDto | null
  onClose: () => void
}

function summaryLine(result: OrderSyncResultDto): string {
  const parts = [`${result.checked} checked`, `${result.updated} updated`]
  if (result.skipped > 0) parts.push(`${result.skipped} skipped`)
  if (result.failed > 0) parts.push(`${result.failed} failed`)
  return parts.join(" · ")
}

export function OrderSyncResultModal({
  result,
  onClose,
}: OrderSyncResultModalProps) {
  return (
    <Dialog open={result !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[85vh] w-[95vw] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-3 px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <div className="text-left">
            <DialogTitle className="text-2xl font-bold tracking-tight text-[#2C3E50]">
              Synced from Shopify
            </DialogTitle>
            <span className="text-sm text-[#7F8C8D]">
              {result ? summaryLine(result) : ""}
            </span>
          </div>
          <Button
            type="button"
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="rounded bg-[#F1F2F6] hover:bg-[#E1E2E6]"
          >
            <XIcon className="size-5 text-[#7F8C8D]" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          {result && result.orders.length === 0 ? (
            <p className="text-sm text-[#4A4A4A]">
              Every order already matches Shopify.
            </p>
          ) : (
            result?.orders.map((entry) => (
              <div
                key={entry.order_id}
                className="rounded-xl border border-[#E8E8E8] p-4"
              >
                <p className="text-sm font-semibold text-[#2C3E50]">
                  #{entry.order_number}
                </p>
                {entry.changes && entry.changes.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {entry.changes.map((change) => (
                      <li key={change} className="text-sm text-[#4A4A4A]">
                        {change}
                      </li>
                    ))}
                  </ul>
                )}
                {entry.warnings && entry.warnings.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {entry.warnings.map((warning) => (
                      <li
                        key={warning}
                        className="rounded-md bg-[#FFF6E5] px-2 py-1 text-sm text-[#8A5A00]"
                      >
                        {warning}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

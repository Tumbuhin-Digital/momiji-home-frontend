"use client"

import { AlertCircle, CheckCircle2, Package } from "lucide-react"

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
import { Spinner } from "@/components/ui/spinner"
import { formatCurrency } from "@/lib/utils"

import type { SecondPaymentConfirmationModalProps } from "@/types/orders"

export function SecondPaymentConfirmationModal({
  order,
  segment,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
  error,
  shippingTotal,
  groupBalanceDue,
}: SecondPaymentConfirmationModalProps) {
  const items = segment?.lineItems?.length
    ? segment.lineItems
    : order.lineItems.filter(
        (item) => item.type === "pre-order" || item.type === "pre_order"
      )

  // Order-level totals are a last resort for the legacy view that has no group context.
  // Reaching for them from inside a group would bill this invoice for the whole order.
  const orderWideBalance =
    order.totalBalanceDue ||
    order.preOrderInfo?.remainingAmount ||
    order.totalPrice - (order.totalDepositPaid || 0)

  const remainingBalance =
    groupBalanceDue ??
    segment?.groupBalanceDue ??
    (segment ? 0 : orderWideBalance)

  // Deliberately not falling back to order.secondPayment.shippingTotal: that sums the
  // final price of every group, which would be paired with a single group's prepaid
  // deduction below and understate the invoice. Group-scoped sources only.
  const shippingAmount =
    shippingTotal ??
    segment?.groupShipping ??
    segment?.shipment?.finalShippingPrice ??
    0

  // Half the carrier estimate was already charged at checkout, so the invoice bills
  // only the difference. Mirrors the backend rounding in RequestSecondPayment so this
  // dialog always shows the exact amount the customer will be sent.
  // 0 for legacy orders placed before the split-shipping scheme — those bill in full.
  // Group-scoped only. The order-level shipment carries the whole order's prepayment,
  // which another group may already have consumed — falling back to it would credit this
  // invoice with money that is not its own and under-bill the customer.
  const prepaidShipping = segment?.shipment?.prepaidShipping ?? 0
  const hasPrepaidShipping = prepaidShipping > 0
  const shippingToBill = Math.max(
    0,
    Math.round((shippingAmount - prepaidShipping) * 100) / 100
  )
  const totalDue = remainingBalance + shippingToBill

  const groupLabel =
    segment?.kind === "preorder_batch" && segment.batchName
      ? segment.batchName
      : segment?.title || "Pre-Order"

  // Notes reach the customer on the invoice, so never show another group's.
  const shippingNotes = segment
    ? segment.shipment?.shippingNotes
    : order.preorderShipment?.shippingNotes

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isConfirming && onClose()}
    >
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Package className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Request Second Payment for #{order.orderNumber}?
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Send a settlement invoice to{" "}
                <span className="font-bold text-slate-800">
                  {order.customer?.name || "Customer"}
                </span>{" "}
                for <strong>{groupLabel}</strong> remaining balance and
                shipping.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        <div className="space-y-3 px-6">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              <Package className="size-3" />
              Items
            </p>
            <div className="max-h-50 divide-y divide-neutral-100 overflow-y-auto rounded border border-neutral-200 bg-neutral-50">
              {items.map((item, idx) => (
                <div
                  key={item.productId || idx}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="truncate font-medium text-neutral-700">
                    {item.title}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-neutral-500">
                    {item.quantity} × {formatCurrency(item.unitPrice)} USD
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded border border-primary/20 bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium text-neutral-600">
              Remaining balance (50%)
            </span>
            <span className="font-bold text-neutral-900">
              {formatCurrency(remainingBalance)} USD
            </span>
          </div>

          {shippingAmount > 0 && (
            <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  {hasPrepaidShipping ? "Shipping - Remaining 50%" : "Shipping"}
                </span>
                <span className="font-bold text-neutral-900">
                  {formatCurrency(shippingToBill)} USD
                </span>
              </div>
              {hasPrepaidShipping && (
                <p className="mt-1 text-xs text-neutral-500">
                  Final {formatCurrency(shippingAmount)} −{" "}
                  {formatCurrency(prepaidShipping)} already paid at checkout
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded border border-primary/30 bg-primary/10 px-4 py-3">
            <span className="text-sm font-semibold text-neutral-700">
              Total invoice amount
            </span>
            <span className="text-lg font-bold text-neutral-900">
              {formatCurrency(totalDue)} USD
            </span>
          </div>

          {shippingNotes && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Shipping notes:</span>{" "}
              {shippingNotes}
            </p>
          )}

          <div className="flex items-start gap-2.5 rounded border border-[#FF850D] bg-[#FF850D1A] p-3.5 text-xs leading-normal text-[#FF850D]">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#FF850D]" />
            <span>
              This will send a Shopify invoice for this group&apos;s remaining
              balance plus shipping. Other groups can be invoiced separately
              once their shipping is configured.
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded border border-destructive/20 bg-destructive/5 p-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter
          variant="bare"
          className="w-full flex-col-reverse gap-3 px-6 pb-6 sm:flex-col-reverse sm:space-x-0 sm:px-6"
        >
          <DialogClose
            render={
              <Button
                variant="outline"
                size="lg"
                className="w-full font-medium text-slate-500"
                onClick={onClose}
                disabled={isConfirming}
              />
            }
          >
            Dismiss
          </DialogClose>
          <Button
            type="button"
            size="lg"
            className="w-full font-medium"
            onClick={() => onConfirm(order.id, segment?.batchId ?? null)}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Send Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

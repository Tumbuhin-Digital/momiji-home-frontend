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
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
  error,
}: SecondPaymentConfirmationModalProps) {
  const preOrderItems = order.lineItems.filter(
    (item) => item.type === "pre-order" || item.type === "pre_order"
  )

  const remainingBalance =
    order.totalBalanceDue ||
    order.preOrderInfo?.remainingAmount ||
    order.totalPrice - (order.totalDepositPaid || 0)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isConfirming && onClose()}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Package className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Second Payment Confirmation for #{order.orderNumber}?
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Please confirm that the second payment has been collected for{" "}
                <span className="font-bold text-slate-800">
                  {order.customer?.name || "Customer"}
                </span>
                .
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
              {preOrderItems.map((item, idx) => (
                <div
                  key={idx}
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
              Total Remaining Balance
            </span>
            <span className="font-bold text-neutral-900">
              {formatCurrency(remainingBalance)} USD
            </span>
          </div>

          <div className="flex items-start gap-2.5 rounded border border-[#FF850D] bg-[#FF850D1A] p-3.5 text-xs leading-normal text-[#FF850D]">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#FF850D]" />
            <span>
              Only mark this order as collected once the payment has been
              received.
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
            onClick={() => onConfirm(order.id)}
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
                Payment Collected
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

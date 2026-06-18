"use client"

import { useState } from "react"

import { AlertCircle } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"

import type { CancelOrderModalProps } from "@/types/orders"

export function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("")

  const handleClose = () => {
    if (!isConfirming) {
      setReason("")
      onClose()
    }
  }

  const handleConfirm = async () => {
    if (!reason.trim()) return
    await onConfirm(order.id, reason.trim())
    setReason("")
  }

  const isReasonEmpty = !reason.trim()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="relative flex size-16 items-center justify-center rounded-full bg-destructive/10 p-3">
            <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20 opacity-20 duration-3000" />
            <AlertCircle className="relative z-10 size-8 text-destructive" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide text-destructive sm:text-[22px]">
                Cancel Order {order.orderNumber}?
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                This action will cancel the order for{" "}
                <span className="font-bold text-slate-800">
                  {order.customer?.name || "Customer"}
                </span>
                . This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Reason + Warning */}
        <div className="space-y-4 px-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">
              Cancellation Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Enter the reason for cancellation (e.g. Out of stock, Customer request, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isConfirming}
              className="min-h-25 resize-none text-sm"
            />
            {isReasonEmpty && reason.length > 0 && (
              <p className="text-xs text-destructive">
                Reason cannot be empty.
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed text-destructive/80">
              Cancelling this order will notify the customer and cannot be
              reversed. Please ensure the reason is accurate.
            </p>
          </div>
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
                onClick={handleClose}
                disabled={isConfirming}
              />
            }
          >
            Dismiss
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="w-full font-medium"
            onClick={handleConfirm}
            disabled={isConfirming || isReasonEmpty}
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { AlertCircle, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import type { CancelOrderModalProps } from "@/types/orders"

export function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: CancelOrderModalProps) {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value)
  }

  const isExpired = order.preOrderState === "EXPIRED"
  const refundPercentage = isExpired ? 0.8 : 1.0
  const refundAmount = order.totalPrice * refundPercentage
  const adminFee = order.totalPrice * (1 - refundPercentage)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl ring-1 ring-foreground/5 sm:max-w-112.5">
        <DialogHeader className="p-6 pb-0">
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="destructive"
              className="text-[10px] font-black tracking-widest uppercase"
            >
              Order Cancellation
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Terminate Order {order.orderNumber}?
          </DialogTitle>
          <DialogDescription className="text-sm">
            This action will cancel the order record and initiate a refund
            process for{" "}
            <span className="font-bold text-foreground">
              {order.customer?.name || "Customer"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Refund Summary
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {refundPercentage * 100}% Refund Rate
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Total</span>
                <span className="font-medium">
                  {formatCurrency(order.totalPrice, order.currency)}
                </span>
              </div>
              {adminFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Admin Fee (20%)</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(adminFee, order.currency)}
                  </span>
                </div>
              )}
              <Separator className="bg-foreground/5" />
              <div className="flex justify-between font-black">
                <span>Net Refund</span>
                <span className="text-lg text-primary">
                  {formatCurrency(refundAmount, order.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed font-medium text-destructive/80">
              {isExpired
                ? "Pesanan ini telah kadaluwarsa (D+7). Refund akan dilakukan sebesar 80% sesuai kebijakan PRD."
                : "Pembatalan oleh Admin akan menginisiasi refund penuh (100%) dan pengiriman notifikasi pembatalan ke pelanggan."}
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-4 border-t bg-muted/30 p-6">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-full"
          >
            Dismiss
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(order.id)}
            disabled={isConfirming}
            className="h-10 rounded-full px-8 text-[10px] font-black tracking-widest uppercase shadow-lg shadow-destructive/20"
          >
            {isConfirming ? (
              "Terminating..."
            ) : (
              <>
                Confirm Cancellation <Trash2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

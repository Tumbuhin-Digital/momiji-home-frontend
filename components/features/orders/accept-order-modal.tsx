"use client"

import { AlertCircle, CheckCircle2, Package } from "lucide-react"

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
import { formatCurrency } from "@/lib/utils"

import type { AcceptOrderModalProps } from "@/types/orders"

export function AcceptOrderModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: AcceptOrderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl ring-1 ring-foreground/5 sm:max-w-125">
        <DialogHeader className="p-6 pb-0">
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/20 text-[10px] font-black tracking-widest text-primary uppercase"
            >
              Pre-Order Orchestration
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Confirm Arrival
          </DialogTitle>
          <DialogDescription className="text-sm">
            Verifying item logistics and preparing final pelunasan invoice for{" "}
            <span className="font-bold text-foreground">
              {order.customer?.name || "Customer"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <div className="rounded-xl border bg-muted/30 p-4">
            <h4 className="mb-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              Shipping Address
            </h4>
            <div className="text-sm">
              <p className="font-bold">{order.customer?.name || "Customer"}</p>
              <p className="text-muted-foreground">
                (Address details will be available from backend)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              <Package className="h-3 w-3" /> Inventory Check
            </h4>
            <div className="space-y-2">
              {order.lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-black">
                    {formatCurrency(item.unitPrice * item.quantity)} USD
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                DP Collected
              </p>
              <p className="text-xl font-black tracking-tighter">
                {formatCurrency(order.preOrderInfo?.dpAmount ?? 0)} USD
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black tracking-widest text-amber-600 uppercase dark:text-amber-400">
                Balance Pending
              </p>
              <p className="text-xl font-black tracking-tighter">
                {formatCurrency(order.preOrderInfo?.remainingAmount ?? 0)} USD
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed font-medium text-amber-800 dark:text-amber-200">
              Aksi ini akan mengubah status Draft Order menjadi Order aktif di
              Shopify. Email pelunasan akan dikirimkan secara otomatis ke
              pelanggan.
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
            variant="default"
            onClick={() => onConfirm(order.id)}
            disabled={isConfirming}
            className="h-10 rounded-full px-8 text-[10px] font-black tracking-widest uppercase shadow-lg shadow-primary/20"
          >
            {isConfirming ? (
              "Processing..."
            ) : (
              <>
                Confirm & Send <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

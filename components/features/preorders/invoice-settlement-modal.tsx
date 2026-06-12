/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"

import { AlertCircle, Loader2, Mail } from "lucide-react"

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

import { useInvoiceSettlement } from "@/hooks/use-preorders"

interface InvoiceSettlementModalProps {
  settlementId: string
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export function InvoiceSettlementModal({
  settlementId,
  orderId,
  isOpen,
  onClose,
}: InvoiceSettlementModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const invoiceMutation = useInvoiceSettlement()

  const isConfirming = invoiceMutation.isPending

  const handleConfirm = async () => {
    setErrorMsg(null)
    try {
      await invoiceMutation.mutateAsync(settlementId)
      onClose()
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrorMsg(
          "Conflict: This settlement is already invoiced or cannot be transitioned to invoiced status at this time."
        )
      } else {
        setErrorMsg(
          err.message ||
            "An unexpected error occurred while marking as invoiced."
        )
      }
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isConfirming && onClose()}
    >
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl ring-1 ring-foreground/5 sm:max-w-md">
        <DialogHeader className="p-6 pb-0">
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-[10px] font-black tracking-widest text-blue-700 uppercase"
            >
              Invoice Settlement
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Mark as Invoiced?
          </DialogTitle>
          <DialogDescription className="text-sm">
            You are about to mark the settlement for Order{" "}
            <span className="font-bold text-foreground">{orderId}</span> as
            invoiced. This should be done after the final invoice has been sent
            to the customer.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed font-medium text-destructive/80">
              {errorMsg}
            </p>
          </div>
        )}

        <DialogFooter className="mt-6 flex items-center justify-between gap-4 border-t bg-muted/30 p-6">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="h-10 rounded-full px-8 text-[10px] font-black tracking-widest uppercase"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Confirm Invoice <Mail className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

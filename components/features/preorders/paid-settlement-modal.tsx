/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

import { usePaidSettlement } from "@/hooks/use-preorders"

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

interface PaidSettlementModalProps {
  settlementId: string
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export function PaidSettlementModal({
  settlementId,
  orderId,
  isOpen,
  onClose,
}: PaidSettlementModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const paidMutation = usePaidSettlement()

  const handleConfirm = async () => {
    setErrorMsg(null)
    try {
      await paidMutation.mutateAsync(settlementId)
      onClose()
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrorMsg(
          "Conflict: This settlement cannot be marked as paid. Ensure it is currently in 'invoiced' status."
        )
      } else {
        setErrorMsg(
          err.message || "An unexpected error occurred while marking as paid."
        )
      }
    }
  }

  const isConfirming = paidMutation.isPending

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
              className="bg-green-100 text-[10px] font-black tracking-widest text-green-700 uppercase"
            >
              Payment Confirmation
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Mark as Paid?
          </DialogTitle>
          <DialogDescription className="text-sm">
            You are about to mark the settlement for Order{" "}
            <span className="font-bold text-foreground">{orderId}</span> as
            fully paid. This should be done after receiving the final payment.
            This action is irreversible.
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
            variant="secondary"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="h-10 rounded-full border border-primary/20 bg-primary/10 px-8 text-[10px] font-black tracking-widest text-primary uppercase hover:bg-primary/20"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Confirm Payment <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

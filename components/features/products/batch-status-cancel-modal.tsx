"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"

interface BatchStatusCancelModalProps {
  isOpen: boolean
  isPending?: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
}

export function BatchStatusCancelModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isPending,
}: BatchStatusCancelModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogPanel className="p-6!">
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl text-slate-900">
              Cancel active pre-order batches?
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed text-slate-500">
              Changing <span className="font-semibold">{productName}</span> away
              from pre-order will cancel all active and queued batches for this
              variant. Closed batches will remain as read-only history.
            </DialogDescription>
          </DialogHeader>
        </DialogPanel>
        <DialogFooter
          variant="bare"
          className="flex-col gap-3 px-6 pb-6 sm:flex-row"
        >
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isPending}
            onClick={onClose}
          >
            Keep Pre-Order
          </Button>
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isPending}
            onClick={onConfirm}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

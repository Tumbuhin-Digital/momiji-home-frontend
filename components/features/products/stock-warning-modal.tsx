"use client"

import { AlertTriangle } from "lucide-react"

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

interface StockWarningModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StockWarningModal({ isOpen, onClose }: StockWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="relative flex size-16 items-center justify-center rounded-full bg-amber-50 p-3">
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-100 opacity-25 duration-3000" />
            <AlertTriangle className="relative z-10 size-8 text-amber-500" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Product Stock Warning
              </DialogTitle>
              <DialogDescription className="mt-2 text-[15px] leading-relaxed text-slate-500">
                This product currently has 0 stock. Setting it to Ship Ready
                will allow it to be shown in the ship ready catalog, but
                customers may not be able to purchase it until stock is updated.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>
        <DialogFooter
          variant="bare"
          className="w-full flex-col gap-3 px-6 pb-6"
        >
          <Button
            type="button"
            size="lg"
            className="w-full font-medium"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

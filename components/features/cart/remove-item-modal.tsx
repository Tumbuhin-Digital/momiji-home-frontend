import { InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { RemoveItemModalProps } from "@/types/cart"

export function RemoveItemModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: RemoveItemModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader className="items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 p-2">
            <InfoIcon className="size-6 text-destructive" />
          </div>
          <DialogTitle className="text-xl text-destructive sm:text-2xl">
            Remove item from cart?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-alternate sm:text-base">
            Are you sure you want to remove{" "}
            <span className="font-bold">{productName || "this item"}</span> from
            your cart?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex flex-1 gap-2 rounded-[6px] bg-[#F1F1F1] px-4 py-2 transition-colors duration-300 ease-out hover:bg-[#F1F1F1]/80"
              onClick={onClose}
            >
              <p className="font-medium text-[#9AA4B2]">Cancel</p>
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            size="lg"
            className="flex flex-1 gap-2 rounded-[6px] px-4 py-2 transition-colors duration-300 ease-out"
          >
            <p className="font-medium">Remove</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

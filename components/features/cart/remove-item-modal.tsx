import { InfoIcon } from "lucide-react"

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
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="relative flex size-16 items-center justify-center rounded-full bg-destructive/10 p-3">
            <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20 opacity-20 duration-3000" />
            <InfoIcon className="relative z-10 size-8 text-destructive" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide text-destructive sm:text-[22px]">
                Remove item from cart?
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold">{productName || "this item"}</span>{" "}
                from your cart?
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>
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
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            size="lg"
            className="w-full font-medium"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

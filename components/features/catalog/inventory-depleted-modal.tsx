"use client"

import Image from "next/image"

import { Boxes } from "lucide-react"

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

import type { InventoryDepletedModalProps } from "@/types/products"

export function InventoryDepletedModal({
  isOpen,
  isPending,
  onClose,
  onConfirm,
  product,
}: InventoryDepletedModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-150" showCloseButton={false}>
        <DialogPanel className="flex flex-col items-center gap-6 p-4! sm:flex-row">
          <div className="relative mx-auto flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F8F9FA] sm:size-40">
            {product?.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product?.title || "Product Image"}
                fill
                className="object-contain p-2 mix-blend-multiply"
              />
            ) : (
              <Boxes className="size-8 text-slate-300" />
            )}
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide text-destructive sm:text-[22px]">
                Ship Ready Inventory Depleted
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                This design has{" "}
                <span className="font-bold text-slate-800">sold out</span>.
                Quantities will now be added on Pre-order basis (50% deposit)
                and fulfilled in the next container
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>
        <DialogFooter
          variant="bare"
          className="w-full flex-col-reverse gap-3 px-6 sm:flex-col-reverse sm:space-x-0 sm:px-6"
        >
          <DialogClose
            render={
              <Button
                variant="outline"
                size="lg"
                className="w-full font-medium text-slate-500"
                onClick={onClose}
                disabled={isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            onClick={onConfirm}
            size="lg"
            className="w-full bg-primary font-medium text-white"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

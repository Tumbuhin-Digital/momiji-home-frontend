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
  DialogTitle,
} from "@/components/ui/dialog"

import type { InventoryDepletedModalProps } from "@/types/products"

export function InventoryDepletedModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: InventoryDepletedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative mx-auto flex h-25 w-30 shrink-0 items-center justify-center overflow-hidden border bg-muted sm:mx-0 sm:h-30 sm:w-35">
            {product?.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product?.title || "Product Image"}
                fill
                className="object-cover"
              />
            ) : (
              <Boxes className="size-8 text-slate-300" />
            )}
          </div>
          <div className="flex-1">
            <DialogHeader className="gap-3 text-center sm:text-left">
              <DialogTitle className="text-xl text-destructive sm:text-2xl">
                Ship Ready Inventory Depleted
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-alternate sm:text-base">
                This design has <span className="font-bold">sold out</span>.
                Quantities will now be added on Pre-order basis (50% deposit)
                and fulfilled in the next container
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
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
            onClick={onConfirm}
            size="lg"
            className="flex flex-1 gap-2 rounded-[6px] px-4 py-2 text-neutral-50 transition-colors duration-300 ease-out"
          >
            <p className="font-medium">Continue</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

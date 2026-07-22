"use client"

import type { ReactNode } from "react"
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

import { withShopifyWidth } from "@/lib/shopify-image"

import type { InventoryDepletedModalProps } from "@/types/products"

export function InventoryDepletedModal({
  isOpen,
  isPending,
  imageUrl,
  productTitle,
  title,
  description,
  onClose,
  onConfirm,
}: InventoryDepletedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogPanel className="p-6!">
          <DialogHeader className="items-start gap-4 p-0 text-left">
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-b from-white via-white to-black/5">
                {imageUrl ? (
                  <Image
                    src={withShopifyWidth(imageUrl, 160)}
                    alt={productTitle || "Product Image"}
                    fill
                    className="object-contain mix-blend-multiply"
                    unoptimized
                  />
                ) : (
                  <Boxes className="size-6 text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {productTitle ? (
                  <div className="text-sm text-slate-400">{productTitle}</div>
                ) : null}
                <DialogTitle className="pt-1 text-lg tracking-wide text-destructive sm:text-[22px]">
                  {title}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-[15px] leading-relaxed text-slate-500">
              {description}
            </DialogDescription>
          </DialogHeader>
        </DialogPanel>
        <DialogFooter
          variant="bare"
          className="w-full flex-col-reverse gap-3 px-6 pb-6 sm:flex-col-reverse sm:space-x-0"
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

export const SHIP_READY_DEPLETED_TITLE = "Ship Ready Inventory Depleted"

export function shipReadyDepletedDescription(): ReactNode {
  return (
    <>
      This design has <span className="font-bold text-slate-800">sold out</span>
      . Quantities will now be added on Pre-order basis (50% deposit) and
      fulfilled in the next container
    </>
  )
}

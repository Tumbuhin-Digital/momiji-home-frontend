"use client"

import { useState } from "react"

import { DollarSign } from "lucide-react"
import { toastManager } from "@/components/ui/toast"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

import { useUpdateVariantPrice } from "@/hooks/use-products"

import type { EditPriceModalProps } from "@/types/products"

export function EditPriceModal({
  isOpen,
  onClose,
  productName,
  currentPrice,
  variantId,
}: EditPriceModalProps) {
  const [price, setPrice] = useState(currentPrice.toFixed(2))
  const updatePriceMutation = useUpdateVariantPrice()

  const isPending = updatePriceMutation.isPending

  const handleSave = async () => {
    const wsPrice = parseFloat(price)
    if (isNaN(wsPrice) || wsPrice < 0) {
      toastManager.add({
        title: "Error",
        description: "Please enter a valid price",
        type: "error",
      })
      return
    }

    try {
      await updatePriceMutation.mutateAsync({
        variantId,
        input: { ws_price: wsPrice },
      })
      onClose()
    } catch {}
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Edit Price
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Updating WS price for{" "}
                <span className="font-bold text-slate-800">{productName}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Price input */}
        <div className="px-6">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Label
              htmlFor="custom-price"
              className="text-[13px] font-medium text-slate-700"
            >
              Custom price for WS$
            </Label>
            <div className="relative flex items-center">
              <div className="absolute left-2 z-10 flex size-7 items-center justify-center rounded-md border border-primary bg-primary/30">
                <span className="text-xs font-semibold text-primary">$</span>
              </div>
              <Input
                id="custom-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isPending}
                className="h-11 rounded-lg border-slate-200 pl-11 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
              />
            </div>
            <p className="text-[12px] text-slate-500">Currency in USD</p>
          </div>
        </div>

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
                disabled={isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="lg"
            className="w-full font-medium"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Price"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

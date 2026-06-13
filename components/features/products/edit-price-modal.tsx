"use client"

import { useState } from "react"

import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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

  const handleSave = async () => {
    const wsPrice = parseFloat(price)
    if (isNaN(wsPrice) || wsPrice < 0) {
      toast.error("Please enter a valid price")
      return
    }

    try {
      await updatePriceMutation.mutateAsync({
        variantId,
        input: { ws_price: wsPrice },
      })
      toast.success("Price updated successfully")
      onClose()
    } catch {
      toast.error("Failed to update price")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogPanel className="flex flex-col items-center gap-6 sm:py-4">
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Edit Price Product
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Product Name:{" "}
                <span className="font-bold text-slate-800">{productName}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="w-full space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
            <Label
              htmlFor="custom-price"
              className="text-[13px] font-medium text-slate-700"
            >
              Custom price for WS$
            </Label>
            <div className="relative flex items-center">
              <div className="absolute left-2 flex h-7 w-7 items-center justify-center rounded-md bg-[#DDE9EA]">
                <span className="text-xs font-semibold text-[#8CAEBA]">$</span>
              </div>
              <Input
                id="custom-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 rounded-lg border-slate-200 pl-11 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
              />
            </div>
            <p className="text-[11px] text-slate-400">Currency in USD</p>
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
                disabled={updatePriceMutation.isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            disabled={updatePriceMutation.isPending}
            className="w-full bg-primary font-medium text-white"
            onClick={handleSave}
            size="lg"
          >
            {updatePriceMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Save product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

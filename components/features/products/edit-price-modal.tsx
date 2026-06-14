"use client"

import { useState } from "react"

import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogPanel } from "@/components/ui/dialog"
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
      <DialogContent className="sm:max-w-2xl">
        <DialogPanel className="flex flex-col gap-6 p-6!">
          <div className="flex flex-col">
            <h1 className="text-[32px] font-medium text-neutral-900">
              Edit Price Product
            </h1>
            <p className="text-lg text-slate-400">
              Product Name: {productName}
            </p>
          </div>

          <div className="w-full space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
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
                className="h-11 rounded-lg border-slate-200 pl-11 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
              />
            </div>
            <p className="text-[12px] text-slate-500">Currency in USD</p>
          </div>

          <Button
            type="button"
            disabled={updatePriceMutation.isPending}
            className="h-11! w-full border-none! bg-blue-400/90 text-base font-medium text-white hover:bg-blue-400"
            onClick={handleSave}
          >
            {updatePriceMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Save product
          </Button>
        </DialogPanel>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"

import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
      <DialogContent className="rounded-xl bg-[#FAF8F5] sm:max-w-106.25">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Edit Price Product
          </DialogTitle>
          <p className="text-sm text-slate-400">Product Name: {productName}</p>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

        <Button
          type="button"
          disabled={updatePriceMutation.isPending}
          className="mt-6 w-full rounded-md bg-[#00A3E8] py-6 text-sm font-semibold text-white transition-colors hover:bg-[#0092D1]"
          onClick={handleSave}
        >
          {updatePriceMutation.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : null}
          Save product
        </Button>
      </DialogContent>
    </Dialog>
  )
}

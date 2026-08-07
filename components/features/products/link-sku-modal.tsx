"use client"

import { useEffect, useState } from "react"

import { Link2 } from "lucide-react"
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

import { useLinkCustomVariantSku } from "@/hooks/use-products"

import type { LinkSkuModalProps } from "@/types/products"

export function LinkSkuModal({
  isOpen,
  onClose,
  productName,
  variantId,
}: LinkSkuModalProps) {
  const [sku, setSku] = useState("")
  const linkMutation = useLinkCustomVariantSku()
  const isPending = linkMutation.isPending

  useEffect(() => {
    if (isOpen) {
      setSku("")
    }
  }, [isOpen])

  const handleSave = async () => {
    const trimmed = sku.trim()
    if (!trimmed) {
      toastManager.add({
        title: "Error",
        description: "SKU is required",
        type: "error",
      })
      return
    }

    try {
      await linkMutation.mutateAsync({
        variant_id: variantId,
        sku: trimmed,
      })
      toastManager.add({
        title: "Linked to Shopify",
        description: "SKU saved and inventory tracking enabled.",
        type: "success",
      })
      onClose()
    } catch {
      // toast handled by api client when present
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Link to Shopify
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Set SKU on Shopify for{" "}
                <span className="font-bold text-slate-800">{productName}</span>{" "}
                and enable inventory tracking.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        <div className="px-6">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Label
              htmlFor="link-sku-input"
              className="text-[13px] font-medium text-slate-700"
            >
              SKU
            </Label>
            <Input
              id="link-sku-input"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={isPending}
              placeholder="e.g. SM-SB-NT"
              className="h-11 rounded border-slate-200 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
            />
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
                Linking...
              </>
            ) : (
              "Link to Shopify"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

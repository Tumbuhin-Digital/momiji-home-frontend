"use client"

import { useState } from "react"

import { Boxes } from "lucide-react"
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

import { useUpdateProductBatch } from "@/hooks/use-products"

export interface UpdateBatchModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
}

export function UpdateBatchModal({
  isOpen,
  onClose,
  productId,
  productName,
}: UpdateBatchModalProps) {
  const [batchLabel, setBatchLabel] = useState("")
  const [shipDate, setShipDate] = useState("")

  const updateBatchMutation = useUpdateProductBatch()
  const isPending = updateBatchMutation.isPending

  const handleClose = () => {
    if (!isPending) {
      setBatchLabel("")
      setShipDate("")
      onClose()
    }
  }

  const handleSave = async () => {
    if (!batchLabel.trim()) {
      toastManager.add({
        title: "Error",
        description: "Batch label is required",
        type: "error",
      })
      return
    }

    try {
      await updateBatchMutation.mutateAsync({
        productId,
        input: {
          preorder_batch_label: batchLabel.trim(),
          expected_ship_date: shipDate ? shipDate : undefined,
        },
      })
      setBatchLabel("")
      setShipDate("")
      onClose()
    } catch {}
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Boxes className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Update Batch
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Updating pre-order batch for{" "}
                <span className="font-bold text-slate-800">{productName}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Form fields */}
        <div className="px-6">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-1.5">
              <Label
                htmlFor="batch-label"
                className="text-[13px] font-medium text-slate-700"
              >
                Pre-Order Batch Label{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="batch-label"
                value={batchLabel}
                onChange={(e) => setBatchLabel(e.target.value)}
                placeholder="e.g. Wave 1, Summer Collection"
                disabled={isPending}
                className="h-11 rounded-lg border-slate-200 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="ship-date"
                className="text-[13px] font-medium text-slate-700"
              >
                Expected Ship Date
              </Label>
              <Input
                id="ship-date"
                type="date"
                value={shipDate}
                onChange={(e) => setShipDate(e.target.value)}
                disabled={isPending}
                className="h-11 rounded-lg border-slate-200 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
              />
              <p className="text-[11px] text-slate-400">Format: YYYY-MM-DD</p>
            </div>
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
                onClick={handleClose}
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
              "Save Batch"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"

import { Loader2 } from "lucide-react"
import { toastManager } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      toastManager.add({
        title: "Success",
        description: "Batch updated successfully",
        type: "success",
      })
      setBatchLabel("")
      setShipDate("")
      onClose()
    } catch {
      toastManager.add({
        title: "Error",
        description: "Failed to update batch",
        type: "error",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xl bg-[#FAF8F5] sm:max-w-md">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Update Batch
          </DialogTitle>
          <p className="text-sm text-slate-400">Product Name: {productName}</p>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <Label
              htmlFor="batch-label"
              className="text-[13px] font-medium text-slate-700"
            >
              Pre-Order Batch Label <span className="text-red-500">*</span>
            </Label>
            <Input
              id="batch-label"
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              placeholder="e.g. Wave 1, Summer Collection"
              className="h-11 rounded-lg border-slate-200 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
            />
          </div>

          <div className="space-y-2">
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
              className="h-11 rounded-lg border-slate-200 text-sm shadow-sm focus-visible:ring-[#00B4F5]"
            />
            <p className="text-[11px] text-slate-400">Format: YYYY-MM-DD</p>
          </div>
        </div>

        <Button
          type="button"
          disabled={updateBatchMutation.isPending}
          className="mt-6 w-full rounded-md bg-[#00A3E8] py-6 text-sm font-semibold text-white transition-colors hover:bg-[#0092D1]"
          onClick={handleSave}
        >
          {updateBatchMutation.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : null}
          Save Batch
        </Button>
      </DialogContent>
    </Dialog>
  )
}

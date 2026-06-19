"use client"

import { useState } from "react"

import { Truck } from "lucide-react"

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

import type { OrderLineItem } from "@/types/orders/entities"

interface UpdateTrackingModalProps {
  item: OrderLineItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (trackingNumber: string, trackingUrl: string) => void
  isConfirming: boolean
}

export function UpdateTrackingModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: UpdateTrackingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")

  const handleClose = () => {
    if (!isConfirming) {
      setTrackingNumber("")
      setTrackingUrl("")
      onClose()
    }
  }

  if (!item) return null

  const isDisabled = !trackingNumber.trim() || !trackingUrl.trim()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Truck className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Add Tracking Number
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Add tracking details for{" "}
                <span className="font-bold text-slate-800">{item.title}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Inputs */}
        <div className="flex flex-col gap-4 px-6">
          <div className="space-y-1.5">
            <Label
              htmlFor="tracking-number"
              className="text-sm font-medium text-neutral-700"
            >
              Tracking Number
            </Label>
            <Input
              id="tracking-number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 9400100000000000000000 (USPS / Unishippers)"
              disabled={isConfirming}
              className="h-11 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="tracking-url"
              className="text-sm font-medium text-neutral-700"
            >
              Tracking URL
            </Label>
            <Input
              id="tracking-url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              disabled={isConfirming}
              className="h-11 text-sm"
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
                onClick={handleClose}
                disabled={isConfirming}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="lg"
            className="w-full font-medium"
            onClick={() => onConfirm(trackingNumber, trackingUrl)}
            disabled={isConfirming || isDisabled}
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

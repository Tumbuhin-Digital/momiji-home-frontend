"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
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

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add Tracking Number</DialogTitle>
          <DialogDescription>
            Add tracking details for {item.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm leading-none font-medium">
              Tracking Number
            </label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. JNE1234567890"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm leading-none font-medium">
              Tracking URL
            </label>
            <Input
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(trackingNumber, trackingUrl)}
            disabled={isConfirming || !trackingNumber || !trackingUrl}
          >
            {isConfirming ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

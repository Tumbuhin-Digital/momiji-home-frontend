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
import { useState, useEffect } from "react"
import type { OrderLineItem } from "@/types/orders/entities"

interface UpdateReceivedModalProps {
  item: OrderLineItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (received: number) => void
  isConfirming: boolean
}

export function UpdateReceivedModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: UpdateReceivedModalProps) {
  const [received, setReceived] = useState<number>(0)

  useEffect(() => {
    if (item?.itemsReceived !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReceived(item.itemsReceived)
    }
  }, [item])

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Update Items Received</DialogTitle>
          <DialogDescription>
            Update the quantity of items received for {item.title}. Max:{" "}
            {item.quantity}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="number"
            min={0}
            max={item.quantity}
            value={received}
            onChange={(e) => setReceived(parseInt(e.target.value) || 0)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(received)} disabled={isConfirming}>
            {isConfirming ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { OrderLineItem } from "@/types/orders/entities"

interface UpdateStepModalProps {
  item: OrderLineItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (step: number) => void
  isConfirming: boolean
}

export function UpdateStepModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: UpdateStepModalProps) {
  const [step, setStep] = useState<string>("1")

  useEffect(() => {
    if (item?.fulfillmentStep) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(item.fulfillmentStep.toString())
    }
  }, [item])

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Update Fulfillment Step</DialogTitle>
          <DialogDescription>
            Change the fulfillment step for {item.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select value={step} onValueChange={setStep}>
            <SelectTrigger>
              <SelectValue placeholder="Select a step" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Step 1: Preparation</SelectItem>
              <SelectItem value="2">Step 2: Processing</SelectItem>
              <SelectItem value="3">Step 3: Ready to Ship</SelectItem>
              <SelectItem value="4">Step 4: Shipped/Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(Number(step))}
            disabled={isConfirming}
          >
            {isConfirming ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

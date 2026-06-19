"use client"

import { useEffect, useState } from "react"

import { ListOrdered } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isConfirming && onClose()}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ListOrdered className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Update Fulfillment Step
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Change the fulfillment step for{" "}
                <span className="font-bold text-slate-800">{item.title}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Select */}
        <div className="px-6">
          <Select
            value={step}
            onValueChange={(v) => setStep(v || "")}
            disabled={isConfirming}
          >
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
            onClick={() => onConfirm(Number(step))}
            disabled={isConfirming}
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

"use client"

import { useEffect, useState } from "react"

import { PackageCheck } from "lucide-react"

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
import { Spinner } from "@/components/ui/spinner"

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isConfirming && onClose()}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <PackageCheck className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Update Items Received
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Update the quantity received for{" "}
                <span className="font-bold text-slate-800">{item.title}</span>.
                Max: {item.quantity}
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Input */}
        <div className="px-6">
          <Input
            type="number"
            min={0}
            max={item.quantity}
            value={received}
            onChange={(e) => setReceived(parseInt(e.target.value) || 0)}
            disabled={isConfirming}
            className="h-11 text-sm"
          />
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
            onClick={() => onConfirm(received)}
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

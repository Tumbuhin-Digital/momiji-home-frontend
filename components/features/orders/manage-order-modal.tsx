"use client"

import { format } from "date-fns"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { OrderFulfillmentPanel } from "@/components/features/orders/order-fulfillment-panel"

import { useOrderById } from "@/hooks/use-orders"

import type { Order } from "@/types/orders"

interface ManageOrderModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
}

export function ManageOrderModal({
  order,
  isOpen,
  onClose,
}: ManageOrderModalProps) {
  const { data: fetchedOrder } = useOrderById(order.id, {
    enabled: isOpen,
  })

  const currentOrder = fetchedOrder || order

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const totalItems = currentOrder.lineItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const shipReadyItems = currentOrder.lineItems.filter(
    (item) =>
      item.type === "ship_ready" ||
      item.type === "ship-ready" ||
      (!item.type && currentOrder.type === "ready")
  )
  const preOrderItems = currentOrder.lineItems.filter(
    (item) =>
      item.type === "pre_order" ||
      item.type === "pre-order" ||
      (!item.type && currentOrder.type === "pre-order")
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-209 max-h-[90vh] w-[95vw] max-w-314.5 flex-col gap-4 overflow-hidden rounded-2xl border-none p-6 shadow-xl sm:max-w-314.5"
        showCloseButton={false}
      >
        <DialogHeader className="flex h-20 shrink-0 flex-col items-center justify-between sm:flex-row">
          <div>
            <DialogTitle className="text-[32px] text-neutral-800">
              {currentOrder.orderNumber}
            </DialogTitle>
            <span className="text-lg text-neutral-400">
              {totalItems} items -{" "}
              {formatCurrency(currentOrder.totalPrice, currentOrder.currency)}
            </span>
          </div>
          <Button
            type="button"
            onClick={onClose}
            size="icon-lg"
            className="rounded-[8px] bg-[#EDEDED]/80 hover:bg-[#EDEDED]"
          >
            <XIcon className="size-6 text-[#697586]" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-[12px] border border-[#69758633] bg-[#F2EDE4] p-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <span>
                <p className="text-sm text-neutral-800">Customer Information</p>
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#32323299]">Name</p>
                <p className="text-[#323232]">
                  {currentOrder.customer?.name || "-"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#32323299]">Order Date</p>
                <p className="text-[#323232]">
                  {currentOrder.orderDate
                    ? format(
                        new Date(currentOrder.orderDate),
                        "dd MMM yyyy, h:mm a"
                      )
                    : "-"}
                </p>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#32323299]">Email</p>
                <p className="text-[#323232]">
                  {currentOrder.customer?.email || "-"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#32323299]">Address</p>
                <p className="text-[#323232]">
                  {currentOrder.shippingAddress
                    ? `${currentOrder.shippingAddress.address1}${
                        currentOrder.shippingAddress.address2
                          ? `, ${currentOrder.shippingAddress.address2}`
                          : ""
                      }, ${currentOrder.shippingAddress.city}, ${
                        currentOrder.shippingAddress.province
                      }, ${currentOrder.shippingAddress.country} ${
                        currentOrder.shippingAddress.zip
                      }`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {shipReadyItems.length > 0 && (
          <OrderFulfillmentPanel order={currentOrder} type="ship-ready" />
        )}

        {preOrderItems.length > 0 && (
          <OrderFulfillmentPanel order={currentOrder} type="pre-order" />
        )}
      </DialogContent>
    </Dialog>
  )
}

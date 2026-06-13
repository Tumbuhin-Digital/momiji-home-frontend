"use client"

import { useEffect } from "react"

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

  useEffect(() => {
    if (isOpen && order?.id) {
      window.history.pushState(null, "", `/order-management/${order.id}`)
    } else {
      window.history.replaceState(null, "", `/order-management`)
    }

    return () => {
      window.history.replaceState(null, "", `/order-management`)
    }
  }, [isOpen, order?.id])

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
        className="flex max-h-[90vh] w-[95vw] max-w-6xl flex-col gap-6 overflow-y-auto rounded-2xl border-none p-8 shadow-xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex shrink-0 flex-col items-center justify-between sm:flex-row">
          <div>
            <DialogTitle className="text-[32px] text-[#2C3E50]">
              {currentOrder.orderNumber}
            </DialogTitle>
            <span className="text-lg text-[#7F8C8D]">
              {totalItems} items -{" "}
              {formatCurrency(currentOrder.totalPrice, currentOrder.currency)}
            </span>
          </div>
          <Button
            type="button"
            onClick={onClose}
            size="icon"
            className="rounded-[8px] bg-[#F1F2F6] hover:bg-[#E1E2E6]"
          >
            <XIcon className="h-5 w-5 text-[#7F8C8D]" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-4 rounded-[12px] border border-[#EBEBEB] bg-[#F4F1ED] p-6">
          <p className="text-sm font-medium text-[#4A4A4A]">
            Customer Information
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Name</p>
                <p className="text-sm text-[#4A4A4A]">
                  {currentOrder.customer?.name || "-"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Order Date</p>
                <p className="text-sm text-[#4A4A4A]">
                  {currentOrder.orderDate
                    ? format(new Date(currentOrder.orderDate), "d MMMM yyyy")
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Email</p>
                <p className="text-sm text-[#4A4A4A]">
                  {currentOrder.customer?.email || "-"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Address</p>
                <p className="text-sm text-[#4A4A4A]">
                  {currentOrder.shippingAddress
                    ? `${currentOrder.shippingAddress.address1}${
                        currentOrder.shippingAddress.address2
                          ? `, ${currentOrder.shippingAddress.address2}`
                          : ""
                      }, ${currentOrder.shippingAddress.city}, ${
                        currentOrder.shippingAddress.country
                      }, ${currentOrder.shippingAddress.zip}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-6 ${
            shipReadyItems.length > 0 && preOrderItems.length > 0
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          {shipReadyItems.length > 0 && (
            <OrderFulfillmentPanel order={currentOrder} type="ship-ready" />
          )}

          {preOrderItems.length > 0 && (
            <OrderFulfillmentPanel order={currentOrder} type="pre-order" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

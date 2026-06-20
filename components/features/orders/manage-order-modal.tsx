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
import { Skeleton } from "@/components/ui/skeleton"

import { OrderFulfillmentPanel } from "@/components/features/orders/order-fulfillment-panel"

import { useOrderById } from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"

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
  const { data: fetchedOrder, isLoading } = useOrderById(order.id, {
    enabled: isOpen,
  })

  const currentOrder = fetchedOrder || order

  useEffect(() => {
    if (isOpen && order?.id) {
      const url = new URL(window.location.href)
      url.searchParams.set("orderId", order.id)
      window.history.replaceState(null, "", url.toString())
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete("orderId")
      window.history.replaceState(null, "", url.toString())
    }

    return () => {
      const url = new URL(window.location.href)
      url.searchParams.delete("orderId")
      window.history.replaceState(null, "", url.toString())
    }
  }, [isOpen, order?.id])

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
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-4 p-0">
          <div className="text-left">
            <DialogTitle className="text-[28px] font-bold tracking-tight text-[#2C3E50] sm:text-[32px]">
              #{currentOrder.orderNumber}
            </DialogTitle>
            <span className="text-sm text-[#7F8C8D] sm:text-lg">
              {totalItems} items - {formatCurrency(currentOrder.totalPrice)} USD
            </span>
          </div>
          <Button
            type="button"
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="shrink-0 rounded-lg bg-[#F1F2F6] hover:bg-[#E1E2E6]"
          >
            <XIcon className="size-5 text-[#7F8C8D]" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-4 rounded-xl border border-[#EBEBEB] bg-[#F4F1ED] p-6">
          <p className="text-sm font-semibold text-[#4A4A4A]">
            Customer Information
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Name</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <p className="text-sm text-[#4A4A4A]">
                    {currentOrder.customer?.name || "-"}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Order Date</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <p className="text-sm text-[#4A4A4A]">
                    {currentOrder.orderDate
                      ? format(new Date(currentOrder.orderDate), "MMMM d, yyyy")
                      : "-"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Email</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-[#4A4A4A]">
                    {currentOrder.customer?.email || "-"}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-[#959595]">Address</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-64" />
                ) : (
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
                )}
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
            <OrderFulfillmentPanel
              order={currentOrder}
              type="ship-ready"
              isLoading={isLoading}
            />
          )}

          {preOrderItems.length > 0 && (
            <OrderFulfillmentPanel
              order={currentOrder}
              type="pre-order"
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

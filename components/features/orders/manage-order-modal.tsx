"use client"

import { useEffect } from "react"

import { format } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
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
import { queryKeys } from "@/lib/query/query-keys"
import { formatCurrency } from "@/lib/utils"

import type { Order, OrderFulfillmentSegment } from "@/types/orders"
import {
  isPreOrderLineItem,
  isShipReadyLineItem,
  orderLineDisplayUnitPrice,
} from "@/types/orders"

interface ManageOrderModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
}

function fallbackSegments(order: Order): OrderFulfillmentSegment[] {
  const shipReadyItems = order.lineItems.filter(
    (item) =>
      isShipReadyLineItem(item) ||
      (!item.type && order.type === "ready")
  )
  const preOrderItems = order.lineItems.filter(
    (item) =>
      isPreOrderLineItem(item) ||
      (!item.type && order.type === "pre-order")
  )
  const segments: OrderFulfillmentSegment[] = []
  if (shipReadyItems.length > 0) {
    segments.push({
      key: "ship_ready",
      kind: "ship_ready",
      title: "Ship Ready",
      lineItems: shipReadyItems,
      fulfillments: [],
    })
  }
  if (preOrderItems.length > 0) {
    segments.push({
      key: "preorder_unbatched",
      kind: "preorder_unbatched",
      title: "Pre-Order",
      lineItems: preOrderItems,
      shipment: order.preorderShipment,
      fulfillments: order.fulfillments ?? [],
    })
  }
  return segments
}

export function ManageOrderModal({
  order,
  isOpen,
  onClose,
}: ManageOrderModalProps) {
  const queryClient = useQueryClient()
  const { data: fetchedOrder, isLoading } = useOrderById(order.id, {
    enabled: isOpen,
  })

  const currentOrder = fetchedOrder || order

  const handleOrderActioned = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.orders.detail(order.id),
    })
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
  }

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

  const segments =
    currentOrder.fulfillmentSegments &&
    currentOrder.fulfillmentSegments.length > 0
      ? currentOrder.fulfillmentSegments
      : fallbackSegments(currentOrder)

  const hasPreorderSegments = segments.some(
    (s) => s.kind === "preorder_batch" || s.kind === "preorder_unbatched"
  )

  // Grand total customer pays: full merchandise (unit × qty) + final shipping.
  const merchandiseTotal = currentOrder.lineItems.reduce((sum, item) => {
    return sum + orderLineDisplayUnitPrice(item) * (item.quantity || 0)
  }, 0)
  const shippingFromSegments = segments.reduce((sum, segment) => {
    const price =
      segment.groupShipping ?? segment.shipment?.finalShippingPrice
    return sum + (price != null ? price : 0)
  }, 0)
  const shippingTotal =
    currentOrder.secondPayment?.shippingTotal ?? shippingFromSegments
  const totalAmount = merchandiseTotal + shippingTotal

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] w-[95vw] max-w-7xl flex-col gap-6 overflow-y-auto rounded-2xl border-none p-8 shadow-xl"
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
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="rounded bg-[#F1F2F6] hover:bg-[#E1E2E6]"
            >
              <XIcon className="size-5 text-[#7F8C8D]" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {hasPreorderSegments && currentOrder.secondPayment && (
          <div className="rounded-lg border border-[#EBEBEB] bg-[#F8F9FA] px-4 py-3 text-sm text-[#4A4A4A]">
            Shipping configured for{" "}
            <span className="font-semibold">
              {currentOrder.secondPayment.configuredGroups}/
              {currentOrder.secondPayment.totalGroups}
            </span>{" "}
            pre-order groups
            {currentOrder.secondPayment.shippingTotal > 0 && (
              <>
                {" "}
                · shipping total{" "}
                <span className="font-semibold">
                  {formatCurrency(currentOrder.secondPayment.shippingTotal)} USD
                </span>
              </>
            )}
          </div>
        )}

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
                <p className="text-xs text-[#959595]">Total Amount</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  <p className="text-lg font-bold text-[#2C3E50]">
                    {formatCurrency(totalAmount)} USD
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-6 ${
            segments.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {segments.map((segment) => (
            <OrderFulfillmentPanel
              key={segment.key}
              order={currentOrder}
              segment={segment}
              isLoading={isLoading}
              onOrderActioned={handleOrderActioned}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

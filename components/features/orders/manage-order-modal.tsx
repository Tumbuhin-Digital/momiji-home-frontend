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

type OrderAddress = NonNullable<Order["shippingAddress"]>

function formatPersonName(
  firstName?: string | null,
  lastName?: string | null
): string {
  return [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")
}

function formatOrderAddress(address: OrderAddress): string {
  const address1 = address.address1?.trim() || ""
  const address2 = address.address2?.trim() || ""
  const zip = address.zip?.trim() || ""

  // Paste autofill often stores the full line in address1 already.
  if (zip && address1.includes(zip)) {
    return [address1, address2].filter(Boolean).join(", ")
  }

  const cityLine = [address.city, address.province, address.zip]
    .filter(Boolean)
    .join(", ")
  return [address1, address2, cityLine, address.country]
    .filter((part) => Boolean(part && String(part).trim()))
    .join(", ")
}

function InfoField({
  label,
  value,
  isLoading,
  strong = false,
}: {
  label: string
  value: string
  isLoading: boolean
  strong?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-[11px] leading-none text-[#959595]">{label}</p>
      {isLoading ? (
        <Skeleton className="h-4 w-28" />
      ) : (
        <p
          className={
            strong
              ? "text-sm leading-snug font-bold text-[#2C3E50]"
              : "text-sm leading-snug text-[#4A4A4A]"
          }
        >
          {value || "-"}
        </p>
      )}
    </div>
  )
}

function fallbackSegments(order: Order): OrderFulfillmentSegment[] {
  const shipReadyItems = order.lineItems.filter(
    (item) =>
      isShipReadyLineItem(item) || (!item.type && order.type === "ready")
  )
  const preOrderItems = order.lineItems.filter(
    (item) =>
      isPreOrderLineItem(item) || (!item.type && order.type === "pre-order")
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
    const price = segment.groupShipping ?? segment.shipment?.finalShippingPrice
    return sum + (price != null ? price : 0)
  }, 0)
  const shippingTotal =
    currentOrder.secondPayment?.shippingTotal ?? shippingFromSegments
  const totalAmount = merchandiseTotal + shippingTotal

  const shippingRecipient = currentOrder.shippingAddress
    ? formatPersonName(
        currentOrder.shippingAddress.firstName,
        currentOrder.shippingAddress.lastName
      )
    : ""
  const billingRecipient = currentOrder.billingAddress
    ? formatPersonName(
        currentOrder.billingAddress.firstName,
        currentOrder.billingAddress.lastName
      )
    : shippingRecipient

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] w-[95vw] max-w-7xl flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-3 px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <div className="text-left">
            <DialogTitle className="text-2xl font-bold tracking-tight text-[#2C3E50] sm:text-[28px]">
              #{currentOrder.orderNumber}
            </DialogTitle>
            <span className="text-sm text-[#7F8C8D]">
              {totalItems} items - {formatCurrency(currentOrder.totalPrice)} USD
            </span>
            {currentOrder.shipTogether && (
              <p className="mt-1 text-xs font-medium text-amber-700">
                Held for combined shipment
                {currentOrder.holdUntilBatch
                  ? ` until ${currentOrder.holdUntilBatch}`
                  : " until pre-order batch is ready"}
              </p>
            )}
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

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          {hasPreorderSegments && currentOrder.secondPayment && (
            <div className="rounded-lg border border-[#EBEBEB] bg-[#F8F9FA] px-3 py-2 text-sm text-[#4A4A4A]">
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
                    {formatCurrency(currentOrder.secondPayment.shippingTotal)}{" "}
                    USD
                  </span>
                </>
              )}
            </div>
          )}

          <div className="rounded-xl border border-[#EBEBEB] bg-[#F4F1ED] px-4 py-4">
            <p className="mb-3 text-xs font-semibold tracking-wide text-[#4A4A4A] uppercase">
              Customer Information
            </p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoField
                label="Customer Name"
                value={currentOrder.customer?.name || "-"}
                isLoading={isLoading}
              />
              <InfoField
                label="Email"
                value={currentOrder.customer?.email || "-"}
                isLoading={isLoading}
              />
              <InfoField
                label="Order Date"
                value={
                  currentOrder.orderDate
                    ? format(new Date(currentOrder.orderDate), "MMMM d, yyyy")
                    : "-"
                }
                isLoading={isLoading}
              />
              <InfoField
                label="Total Amount"
                value={`${formatCurrency(totalAmount)} USD`}
                isLoading={isLoading}
                strong
              />
              <InfoField
                label="Shipping Recipient"
                value={shippingRecipient || "-"}
                isLoading={isLoading}
              />
              <InfoField
                label="Billing Name"
                value={billingRecipient || "-"}
                isLoading={isLoading}
              />
              <InfoField
                label="Company (Ship To)"
                value={currentOrder.shippingAddress?.company || "-"}
                isLoading={isLoading}
              />
              <InfoField
                label="Company (Bill To)"
                value={
                  currentOrder.billingAddress?.company ||
                  currentOrder.shippingAddress?.company ||
                  "-"
                }
                isLoading={isLoading}
              />
              <InfoField
                label="Shipping Phone"
                value={currentOrder.shippingAddress?.phone || "-"}
                isLoading={isLoading}
              />
              <InfoField
                label="Billing Phone"
                value={
                  currentOrder.billingAddress?.phone ||
                  currentOrder.shippingAddress?.phone ||
                  "-"
                }
                isLoading={isLoading}
              />
              <InfoField
                label="Shipping Address"
                value={
                  currentOrder.shippingAddress
                    ? formatOrderAddress(currentOrder.shippingAddress)
                    : "-"
                }
                isLoading={isLoading}
              />
              <InfoField
                label="Billing Address"
                value={
                  currentOrder.billingAddress
                    ? formatOrderAddress(currentOrder.billingAddress)
                    : currentOrder.shippingAddress
                      ? formatOrderAddress(currentOrder.shippingAddress)
                      : "-"
                }
                isLoading={isLoading}
              />
            </div>
          </div>

          <div
            className={`grid gap-4 ${
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

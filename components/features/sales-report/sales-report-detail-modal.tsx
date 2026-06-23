"use client"

import Image from "next/image"

import Autoplay from "embla-carousel-autoplay"
import { format } from "date-fns"
import {
  AlertCircle,
  Boxes,
  Calendar,
  Copy,
  Package,
  Truck,
  XIcon,
} from "lucide-react"

import { toastManager } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { StatusBadge } from "@/components/global/status-badge"

import { useOrderById } from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"

import type { OrderLineItem, SalesReportDetailModalProps } from "@/types/orders"

const itemStatusLabelMap: Record<string, string> = {
  paid: "Paid",
  pending_deposit: "Pending Deposit",
  waiting_payment: "Waiting for Payment",
  payment_received: "Payment Received",
  pending: "Pending",
  fulfilled: "Fulfilled",
}

const fulfillmentStepLabelMap: Record<number, string> = {
  1: "Preparation",
  2: "Processing",
  3: "Ready to Ship",
  4: "Shipped / Completed",
}

function formatOrderDate(dateString?: string) {
  if (!dateString) return "-"
  return format(new Date(dateString), "MMM d, yyyy, h:mm a")
}

export function SalesReportDetailModal({
  orderId,
  isOpen,
  onClose,
}: SalesReportDetailModalProps) {
  const {
    data: order,
    isLoading,
    isError,
  } = useOrderById(isOpen ? (orderId ?? "") : "")

  const shipReadyItems =
    order?.lineItems.filter(
      (item) => item.type === "ship-ready" || item.type === "ship_ready"
    ) ?? []
  const preOrderItems =
    order?.lineItems.filter(
      (item) => item.type === "pre-order" || item.type === "pre_order"
    ) ?? []
  const hasItems = shipReadyItems.length > 0 || preOrderItems.length > 0

  const handleCopyOrderNumber = () => {
    if (!order) return
    navigator.clipboard.writeText(order.orderNumber)
    toastManager.add({
      title: "Copied",
      description: `Order number ${order.orderNumber} copied to clipboard`,
      type: "success",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] w-[95vw] max-w-5xl flex-col gap-4 overflow-y-auto rounded-2xl border-none p-5 shadow-xl sm:gap-6 sm:p-8"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-8 w-40 rounded" />
              ) : (
                <>
                  <DialogTitle className="text-[28px] leading-none font-bold tracking-tight text-neutral-900 sm:text-[32px]">
                    #{order?.orderNumber ?? "Order"}
                  </DialogTitle>
                  {order && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-neutral-400 hover:text-neutral-700"
                      onClick={handleCopyOrderNumber}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  )}
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-48 rounded" />
            ) : (
              order && (
                <DialogDescription className="flex items-center gap-1.5 text-base text-neutral-500">
                  <Calendar className="size-4" />
                  {formatOrderDate(order.orderDate)}
                </DialogDescription>
              )
            )}
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
            {order && (
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge
                  status={order.aggregateStatus}
                  className="h-6! rounded-full px-3 text-xs capitalize"
                />
                <StatusBadge
                  status={order.paymentStatus}
                  className="h-6! rounded-full px-3 text-xs capitalize"
                />
                <StatusBadge
                  status={order.fulfillmentStatus}
                  className="h-6! rounded-full px-3 text-xs capitalize"
                />
              </div>
            )}
            <Button
              type="button"
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="shrink-0 rounded bg-neutral-100 hover:bg-neutral-200"
            >
              <XIcon className="size-5 text-neutral-500" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {isError || (!isLoading && !order) ? (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load order details. Please try again.
            </p>
          </div>
        ) : (
          <>
            {/* Customer Information */}
            <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-6">
              <p className="text-sm font-semibold text-neutral-700">
                Customer Information
              </p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-neutral-400">Name</p>
                    {isLoading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <p className="text-sm text-neutral-700">
                        {order?.customer?.name || "-"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-neutral-400">Email</p>
                    {isLoading ? (
                      <Skeleton className="h-4 w-40" />
                    ) : (
                      <p className="text-sm text-neutral-700">
                        {order?.customer?.email || "-"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-neutral-400">Shipping Address</p>
                    {isLoading ? (
                      <Skeleton className="h-4 w-64" />
                    ) : (
                      <p className="text-sm text-neutral-700">
                        {order?.shippingAddress
                          ? `${order.shippingAddress.address1}${
                              order.shippingAddress.address2
                                ? `, ${order.shippingAddress.address2}`
                                : ""
                            }, ${order.shippingAddress.city}, ${
                              order.shippingAddress.province
                            } ${order.shippingAddress.zip}, ${
                              order.shippingAddress.country
                            }`
                          : "-"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-neutral-400">Phone</p>
                    {isLoading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <p className="text-sm text-neutral-700">
                        {order?.shippingAddress?.phone || "-"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {isLoading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : !hasItems ? (
              <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-400">
                No items in this order.
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {shipReadyItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                      <Truck className="size-3.5" />
                      Ship Ready Items
                      {shipReadyItems.length > 1 &&
                        ` (${shipReadyItems.length})`}
                    </p>
                    {shipReadyItems.length > 1 ? (
                      <Carousel
                        opts={{ align: "start", loop: true }}
                        plugins={[
                          Autoplay({ delay: 5000, stopOnInteraction: true }),
                        ]}
                        className="w-full"
                      >
                        <CarouselContent className="-ml-2 sm:-ml-4">
                          {shipReadyItems.map((item) => (
                            <CarouselItem
                              key={item.productId}
                              className="basis-full pl-2 sm:pl-4"
                            >
                              <LineItemCard item={item} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    ) : (
                      <div className="space-y-2">
                        <LineItemCard item={shipReadyItems[0]} />
                      </div>
                    )}
                  </div>
                )}

                {preOrderItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                      <Package className="size-3.5" />
                      Pre-Order Items
                      {preOrderItems.length > 1 && ` (${preOrderItems.length})`}
                    </p>
                    {preOrderItems.length > 1 ? (
                      <Carousel
                        opts={{ align: "start", loop: true }}
                        plugins={[
                          Autoplay({ delay: 5000, stopOnInteraction: true }),
                        ]}
                        className="w-full"
                      >
                        <CarouselContent className="-ml-2 sm:-ml-4">
                          {preOrderItems.map((item) => (
                            <CarouselItem
                              key={item.productId}
                              className="basis-full pl-2 sm:pl-4"
                            >
                              <LineItemCard item={item} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    ) : (
                      <div className="space-y-2">
                        <LineItemCard item={preOrderItems[0]} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Summary */}
            {!isLoading && order && (
              <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-neutral-50">
                <SummaryRow
                  label="Ship Ready Subtotal"
                  value={order.totalShipReady ?? 0}
                />
                <SummaryRow
                  label="Deposit Paid (Pre-Order)"
                  value={order.totalDepositPaid ?? 0}
                />
                <SummaryRow
                  label="Balance Due"
                  value={order.totalBalanceDue ?? 0}
                  valueClassName={
                    (order.totalBalanceDue ?? 0) > 0
                      ? "text-destructive"
                      : undefined
                  }
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-700">
                    Total Charged Now
                  </span>
                  <span className="text-lg font-bold text-neutral-900">
                    {formatCurrency(order.totalChargedNow ?? 0)}{" "}
                    {order.currency}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className={`font-medium text-neutral-700 ${valueClassName ?? ""}`}>
        {formatCurrency(value)} USD
      </span>
    </div>
  )
}

function LineItemCard({ item }: { item: OrderLineItem }) {
  const isPreOrder = item.type === "pre-order" || item.type === "pre_order"
  const finalAmount = item.finalAmount ?? item.unitPrice * item.quantity

  return (
    <div className="flex gap-3 rounded border border-neutral-200 p-3">
      {/* Thumbnail */}
      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-linear-to-b from-white via-white to-black/5 ring-1 ring-neutral-200">
        {item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt={item.title}
            fill
            className="object-contain mix-blend-multiply"
          />
        ) : (
          <Boxes className="size-5 text-neutral-300" />
        )}
      </div>

      {/* Detail */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
          <p className="text-sm font-semibold text-neutral-900 sm:truncate">
            {item.title}
          </p>
          <span className="shrink-0 text-sm font-bold text-neutral-900 sm:text-base">
            {formatCurrency(finalAmount)} USD
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge
            status={isPreOrder ? "Pre-Order" : "Ship Ready"}
            className="h-5! rounded-full px-2 text-[10px] font-semibold uppercase"
          />
          {item.itemStatus && (
            <StatusBadge
              status={itemStatusLabelMap[item.itemStatus] || item.itemStatus}
              className="h-5! rounded-full px-2 text-[10px]"
            />
          )}
        </div>

        <p className="text-xs text-neutral-500">
          {item.quantity} × {formatCurrency(item.unitPrice)} USD
          {isPreOrder && item.dpAmount !== undefined && (
            <>
              {" "}
              · Deposit {formatCurrency(item.dpAmount)} USD
              {item.balanceDue !== undefined && (
                <> · Balance {formatCurrency(item.balanceDue)} USD</>
              )}
            </>
          )}
        </p>

        {item.fulfillmentStep !== undefined && (
          <p className="text-xs text-neutral-400">
            Step {item.fulfillmentStep}:{" "}
            {fulfillmentStepLabelMap[item.fulfillmentStep] || "—"} ·{" "}
            {item.itemsReceived ?? 0}/{item.quantity} received
          </p>
        )}
      </div>
    </div>
  )
}

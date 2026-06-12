"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Truck,
  User,
  ExternalLink,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useAcceptOrder,
  useCancelOrder,
  useOrderById,
  useUpdateItemReceived,
  useUpdateItemStep,
  useUpdateItemTracking,
} from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"

import type { OrderLineItem } from "@/types/orders/entities"

const AcceptOrderModal = dynamic(
  () =>
    import("@/components/features/orders/accept-order-modal").then(
      (mod) => mod.AcceptOrderModal
    ),
  { ssr: false }
)
const CancelOrderModal = dynamic(
  () =>
    import("@/components/features/orders/cancel-order-modal").then(
      (mod) => mod.CancelOrderModal
    ),
  { ssr: false }
)
const UpdateStepModal = dynamic(
  () => import("./update-step-modal").then((mod) => mod.UpdateStepModal),
  { ssr: false }
)
const UpdateReceivedModal = dynamic(
  () =>
    import("./update-received-modal").then((mod) => mod.UpdateReceivedModal),
  { ssr: false }
)
const UpdateTrackingModal = dynamic(
  () =>
    import("./update-tracking-modal").then((mod) => mod.UpdateTrackingModal),
  { ssr: false }
)

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const [selectedStepItem, setSelectedStepItem] =
    useState<OrderLineItem | null>(null)
  const [selectedReceivedItem, setSelectedReceivedItem] =
    useState<OrderLineItem | null>(null)
  const [selectedTrackingItem, setSelectedTrackingItem] =
    useState<OrderLineItem | null>(null)

  const { data: order, isLoading, error } = useOrderById(orderId)

  const acceptOrder = useAcceptOrder()
  const cancelOrder = useCancelOrder()

  const updateStep = useUpdateItemStep()
  const updateReceived = useUpdateItemReceived()
  const updateTracking = useUpdateItemTracking()

  const handleAccept = () => {
    setIsAcceptModalOpen(true)
  }

  const handleCancel = () => {
    setIsCancelModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Skeleton className="h-50 w-full rounded-xl" />
            <Skeleton className="h-100 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-75 w-full rounded-xl" />
            <Skeleton className="h-50 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">
          The order you are looking for does not exist.
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const isPreOrder = order.type === "pre-order" || order.type === "mixed"

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/order-management">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {order.orderNumber}
              </h1>

              {order.paymentStatus === "paid" ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                  Paid
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-amber-500/50 text-amber-600"
                >
                  Pending
                </Badge>
              )}

              {isPreOrder && <Badge variant="secondary">Pre-Order</Badge>}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Placed on{" "}
              {new Date(order.orderDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.shopifyDraftOrderId && (
            <Button variant="outline" asChild>
              <a
                href={order.shopifyDraftOrderId}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Invoice
              </a>
            </Button>
          )}

          {order.fulfillmentStatus !== "cancelled" && (
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={handleCancel}
              disabled={cancelOrder.isPending}
            >
              Cancel Order
            </Button>
          )}

          {order.preOrderState === "DP_PAID" && (
            <Button onClick={handleAccept} disabled={acceptOrder.isPending}>
              Accept Pre-Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                          <Package className="h-6 w-6 text-muted-foreground/50" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.title}</p>
                            {item.type === "pre_order" ||
                            item.type === "pre-order" ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] uppercase"
                              >
                                Pre-Order
                              </Badge>
                            ) : item.type === "ship_ready" ||
                              item.type === "ship-ready" ||
                              (!item.type && order.type === "ready") ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/50 bg-emerald-500/10 text-[10px] text-emerald-600 uppercase"
                              >
                                Ship Ready
                              </Badge>
                            ) : null}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                        <p className="mt-1 text-sm font-bold">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Item Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex flex-1 items-center justify-between rounded-md border bg-muted/20 p-3 sm:flex-initial sm:justify-start sm:gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Fulfillment Step
                          </span>
                          <span className="text-sm font-semibold">
                            {item.fulfillmentStep || 1} / 4
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedStepItem(item)}
                        >
                          Update
                        </Button>
                      </div>

                      <div className="flex flex-1 items-center justify-between rounded-md border bg-muted/20 p-3 sm:flex-initial sm:justify-start sm:gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Received
                          </span>
                          <span className="text-sm font-semibold">
                            {item.itemsReceived || 0} / {item.quantity}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedReceivedItem(item)}
                        >
                          Update
                        </Button>
                      </div>

                      <div className="flex flex-1 items-center justify-between rounded-md border bg-muted/20 p-3 sm:flex-initial sm:justify-start sm:gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Tracking
                          </span>
                          {item.trackingNumber ? (
                            <a
                              href={item.trackingUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              {item.trackingNumber}
                            </a>
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              -
                            </span>
                          )}
                        </div>
                        {!item.trackingNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedTrackingItem(item)}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
                </div>
                {isPreOrder && order.preOrderInfo && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Deposit Paid
                      </span>
                      <span className="text-emerald-600">
                        -{formatCurrency(order.preOrderInfo.dpAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-medium">
                      <span>Remaining Balance</span>
                      <span className="text-amber-600">
                        {formatCurrency(order.preOrderInfo.remainingAmount)}
                      </span>
                    </div>
                  </>
                )}
                {!isPreOrder && (
                  <div className="mt-4 flex justify-between border-t pt-4 text-lg font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalPrice)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {order.customer?.name || "No Name"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.email || "No Email"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Shipping Address</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  (Address details will be available from backend)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-linear-to-b before:from-transparent before:via-muted before:to-transparent md:before:mx-auto md:before:translate-x-0">
                <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-primary text-white shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] rounded border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm font-bold">Order Placed</div>
                      <time className="text-xs font-medium text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>

                {isPreOrder && order.preOrderInfo?.dpPaidAt && (
                  <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-emerald-500 text-white shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="w-[calc(100%-4rem)] rounded border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="text-sm font-bold">Deposit Paid</div>
                        <time className="text-xs font-medium text-muted-foreground">
                          {new Date(
                            order.preOrderInfo.dpPaidAt
                          ).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </div>
                )}

                {order.fulfillmentStatus === "shipped" &&
                  order.fulfillment?.shippedAt && (
                    <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-blue-500 text-white shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] rounded border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="text-sm font-bold">Shipped</div>
                          <time className="text-xs font-medium text-muted-foreground">
                            {new Date(
                              order.fulfillment.shippedAt
                            ).toLocaleDateString()}
                          </time>
                        </div>
                        {order.fulfillment.trackingNumber && (
                          <p className="text-xs text-muted-foreground">
                            Tracking: {order.fulfillment.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AcceptOrderModal
        order={order}
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={async (id: string) => {
          await acceptOrder.mutateAsync({ orderId: id })
          setIsAcceptModalOpen(false)
        }}
        isConfirming={acceptOrder.isPending}
      />

      <CancelOrderModal
        order={order}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={async (id: string) => {
          await cancelOrder.mutateAsync({ orderId: id, reason: "" })
          setIsCancelModalOpen(false)
        }}
        isConfirming={cancelOrder.isPending}
      />

      <UpdateStepModal
        item={selectedStepItem}
        isOpen={!!selectedStepItem}
        onClose={() => setSelectedStepItem(null)}
        onConfirm={async (step: number) => {
          if (!selectedStepItem) return
          await updateStep.mutateAsync({
            orderId,
            itemId: selectedStepItem.productId,
            body: { fulfillment_step: step },
          })
          setSelectedStepItem(null)
        }}
        isConfirming={updateStep.isPending}
      />

      <UpdateReceivedModal
        item={selectedReceivedItem}
        isOpen={!!selectedReceivedItem}
        onClose={() => setSelectedReceivedItem(null)}
        onConfirm={async (received: number) => {
          if (!selectedReceivedItem) return
          await updateReceived.mutateAsync({
            orderId,
            itemId: selectedReceivedItem.productId,
            body: { items_received: received },
          })
          setSelectedReceivedItem(null)
        }}
        isConfirming={updateReceived.isPending}
      />

      <UpdateTrackingModal
        item={selectedTrackingItem}
        isOpen={!!selectedTrackingItem}
        onClose={() => setSelectedTrackingItem(null)}
        onConfirm={async (trackingNumber: string, trackingUrl: string) => {
          if (!selectedTrackingItem) return
          await updateTracking.mutateAsync({
            orderId,
            itemId: selectedTrackingItem.productId,
            body: {
              tracking_number: trackingNumber,
              tracking_url: trackingUrl,
            },
          })
          setSelectedTrackingItem(null)
        }}
        isConfirming={updateTracking.isPending}
      />
    </div>
  )
}

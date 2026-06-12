"use client"

import { useOrderById } from "@/hooks/use-orders"
import { CustomerOrderCard } from "../checkout/customer-order-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Truck, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CustomerTrackingClient({
  orderId,
}: {
  orderId: string
}) {
  const { data: order, isLoading, error } = useOrderById(orderId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6 py-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-75 w-full rounded-xl" />
        <Skeleton className="h-50 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">
          The order you are looking for could not be found.
        </p>
      </div>
    )
  }

  const isPreOrder = order.type === "pre-order" || order.type === "mixed"

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 py-12">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight text-header">
          Track Your Order
        </h1>
        <p className="text-muted-foreground">
          Order #{order.orderNumber || order.id.slice(0, 8)}
        </p>
      </div>

      <CustomerOrderCard order={order} />

      <Card className="border-none shadow-xl ring-1 ring-foreground/5">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" /> Shipping Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
                <p className="text-xs text-muted-foreground">
                  Your order has been received.
                </p>
              </div>
            </div>

            {isPreOrder && order.preOrderInfo?.dpPaidAt && (
              <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-emerald-500 text-white shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <CheckCircle2 className="h-5 w-5" />
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
                  <p className="text-xs text-muted-foreground">
                    Pre-order secured.
                  </p>
                </div>
              </div>
            )}

            {order.fulfillmentStatus === "shipped" ||
            order.fulfillmentStatus === "delivered" ? (
              <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-blue-500 text-white shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="w-[calc(100%-4rem)] rounded border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-bold">Shipped</div>
                    {order.fulfillment?.shippedAt && (
                      <time className="text-xs font-medium text-muted-foreground">
                        {new Date(
                          order.fulfillment.shippedAt
                        ).toLocaleDateString()}
                      </time>
                    )}
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Your package is on its way.
                  </p>

                  {/* TRACKING NUMBER */}
                  {order.fulfillment?.trackingNumber && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                      <p className="mb-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        Tracking Number
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-sm font-bold">
                          {order.fulfillment.trackingNumber}
                        </p>
                        {order.fulfillment?.carrier && (
                          <Badge variant="outline">
                            {order.fulfillment.carrier}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="group is-active relative flex items-center justify-between opacity-50 md:justify-normal md:odd:flex-row-reverse">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-muted text-muted-foreground shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="w-[calc(100%-4rem)] rounded border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                  <div className="text-sm font-bold">Awaiting Shipment</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We are preparing your items.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

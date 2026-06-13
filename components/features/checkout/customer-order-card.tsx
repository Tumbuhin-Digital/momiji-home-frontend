/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Link from "next/link"

import {
  Clock,
  CreditCard,
  ExternalLink,
  Package,
  ReceiptText,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { formatCurrency } from "@/lib/utils"

import type { CustomerOrderCardProps } from "@/types/orders"

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  PENDING: {
    label: "Pending Approval",
    color: "bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Awaiting Payment",
    color: "bg-blue-500/10 text-blue-600",
    icon: CreditCard,
  },
  PAID: {
    label: "Payment Secured",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: Package,
  },
  SHIPPED: {
    label: "Dispatched",
    color: "bg-purple-500/10 text-purple-600",
    icon: Package,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-destructive/10 text-destructive",
    icon: Clock,
  },
}

export function CustomerOrderCard({ order }: CustomerOrderCardProps) {
  const getStatusKey = () => {
    if (order.fulfillmentStatus === "cancelled") return "CANCELLED"
    if (
      order.fulfillmentStatus === "shipped" ||
      order.fulfillmentStatus === "delivered"
    )
      return "SHIPPED"
    if (order.paymentStatus === "paid") return "PAID"
    if (order.paymentStatus === "pending" && order.type !== "ready")
      return "ACCEPTED"
    return "PENDING"
  }

  const statusKey = getStatusKey()
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING
  const StatusIcon = status.icon

  const isPreOrder = order.type === "pre-order" || order.type === "mixed"
  const needsPelunasan =
    statusKey === "ACCEPTED" &&
    isPreOrder &&
    order.preOrderInfo &&
    !order.preOrderInfo.remainingPaidAt

  const shopifyOrderUrl = order.shopifyOrderId?.startsWith("http")
    ? order.shopifyOrderId
    : `/orders/${order.id}`
  const invoiceUrl = order.shopifyDraftOrderId || shopifyOrderUrl
  const payBalanceUrl = order.shopifyDraftOrderId || shopifyOrderUrl

  return (
    <Card className="overflow-hidden border-none shadow-xl ring-1 ring-foreground/5">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${status.color}`}
                >
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                    Order Request
                  </p>
                  <h4 className="font-mono text-sm font-bold">
                    #{order.id.slice(0, 8)}
                  </h4>
                </div>
              </div>
              <Badge
                className={`rounded-full border-none px-3 py-1 text-[10px] font-black uppercase ${status.color}`}
              >
                {status.label}
              </Badge>
            </div>

            <div className="space-y-3">
              {order.lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted" />
                    <p className="text-xs font-bold">
                      {item.quantity}x {item.title}
                    </p>
                  </div>
                  <p className="font-mono text-[10px] font-bold opacity-60">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full bg-muted/20 p-6 md:w-72">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Total Value
                </span>
                <span className="font-mono text-sm font-black">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>

              {order.preOrderInfo && (
                <div className="rounded-xl bg-background/50 p-3 ring-1 ring-foreground/5">
                  <div className="mb-2 flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground">Deposit Paid</span>
                    <span className="text-emerald-600">
                      {formatCurrency(order.preOrderInfo.dpAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="text-amber-600">
                      {formatCurrency(order.preOrderInfo.remainingAmount)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full rounded-xl text-[10px] font-black tracking-widest uppercase"
                  render={
                    <Link
                      href={invoiceUrl}
                      target={order.shopifyDraftOrderId ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ReceiptText className="mr-2 h-3 w-3 opacity-40" />
                  View Invoice
                </Button>

                {needsPelunasan && (
                  <Button
                    size="sm"
                    className="h-9 w-full rounded-xl bg-amber-500 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-amber-500/20 hover:bg-amber-600"
                    render={
                      <Link
                        href={payBalanceUrl}
                        target={order.shopifyDraftOrderId ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <CreditCard className="mr-2 h-3 w-3" />
                    Pay Balance
                  </Button>
                )}

                {statusKey === "PAID" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 w-full rounded-xl text-[10px] font-black tracking-widest uppercase"
                    render={
                      <Link
                        href={shopifyOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLink className="mr-2 h-3 w-3 opacity-40" />
                    Shopify Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

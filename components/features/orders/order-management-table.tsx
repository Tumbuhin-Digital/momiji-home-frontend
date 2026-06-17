/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"

import { format } from "date-fns"
import { Pencil } from "lucide-react"

import { formatCurrency } from "@/lib/utils"

import { StatusBadge } from "@/components/global/status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ManageOrderModal } from "@/components/features/orders/manage-order-modal"
import { OrderManagementTableEmpty } from "@/components/features/orders/order-management-table-empty"
import { OrderManagementTableSkeleton } from "@/components/features/orders/order-management-table-skeleton"

import type { Order } from "@/types/orders"

interface OrderManagementTableProps {
  orders: Order[]
  isLoading: boolean
}

export function OrderManagementTable({
  orders,
  isLoading,
}: OrderManagementTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const getStatusBadge = (status: string) => {
    return (
      <StatusBadge
        status={status || "Pending"}
        className="w-28 rounded-full px-4 py-3 text-center"
      />
    )
  }

  if (!isLoading && !orders.length) {
    return <OrderManagementTableEmpty />
  }

  return (
    <>
      <div className="overflow-hidden rounded-t-[8px] bg-[#F9F9F9]">
        <div className="h-[calc(100vh-150px)] overflow-x-auto overflow-y-auto">
          <table className="w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-[#F2EDE4]">
              <TableRow className="border-none">
                <TableHead className="px-6 py-4 font-medium text-black">
                  ORDER ID
                </TableHead>
                <TableHead className="px-6 py-4 font-medium text-black">
                  CUSTOMER
                </TableHead>
                <TableHead className="px-6 py-4 font-medium text-black">
                  ORDER DATE
                </TableHead>
                <TableHead className="px-6 py-4 font-medium text-black">
                  STATUS
                </TableHead>
                <TableHead className="px-6 py-4 font-medium text-black">
                  ITEM RECEIVED
                </TableHead>
                <TableHead className="px-6 py-4 font-medium text-black">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-primary/50">
              {isLoading && <OrderManagementTableSkeleton />}
              {!isLoading &&
                orders.map((order) => {
                  const totalItems = order.lineItems.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  )
                  const receivedItems = order.lineItems.reduce(
                    (acc, item) => acc + (item.itemsReceived || 0),
                    0
                  )
                  const progressPercentage =
                    totalItems > 0 ? (receivedItems / totalItems) * 100 : 0

                  const displayStatus =
                    order.fulfillmentStatus === "unfulfilled" &&
                    order.paymentStatus === "pending"
                      ? "Pending"
                      : order.fulfillmentStatus === "delivered"
                        ? "Completed"
                        : "In Progress"

                  const isCompleted = displayStatus === "Completed"
                  const isPending = displayStatus === "Pending"

                  const progressBgClass = isPending
                    ? "bg-neutral-200"
                    : "bg-emerald-500"

                  return (
                    <TableRow
                      key={order.id}
                      className="border-b border-black/10 last:border-0 hover:bg-muted/50"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">#{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {totalItems} item - {formatCurrency(order.totalPrice)}{" "}
                          USD
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">
                          {order.customer?.name || "-"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer?.email || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">
                          {order.orderDate
                            ? format(new Date(order.orderDate), "d/MM/yyyy")
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(displayStatus)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-200">
                            <div
                              className={`h-full rounded-full ${progressBgClass}`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {receivedItems}/{totalItems}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="xl"
                            className="gap-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Pencil className="size-4" />
                            <span>Manage</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <ManageOrderModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  )
}

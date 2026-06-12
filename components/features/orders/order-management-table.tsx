"use client"

import { useState } from "react"

import Link from "next/link"

import { format } from "date-fns"
import { Eye, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
    switch (status?.toLowerCase()) {
      case "on progress":
      case "processing":
      case "pending":
        return (
          <Badge className="rounded-full bg-amber-100 px-4 py-1 text-amber-700 hover:bg-amber-100/80">
            {status}
          </Badge>
        )
      case "completed":
      case "shipped":
      case "delivered":
        return (
          <Badge className="rounded-full bg-emerald-100 px-4 py-1 text-emerald-700 hover:bg-emerald-100/80">
            {status}
          </Badge>
        )
      default:
        return (
          <Badge className="rounded-full bg-gray-100 px-4 py-1 text-gray-700 hover:bg-gray-100/80">
            {status || "Pending"}
          </Badge>
        )
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return <OrderManagementTableSkeleton />
  }

  if (!orders.length) {
    return <OrderManagementTableEmpty />
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader className="bg-[#FAF7F2]">
            <TableRow className="border-none">
              <TableHead className="py-4 font-bold text-black">
                ORDER ID
              </TableHead>
              <TableHead className="py-4 font-bold text-black">
                CUSTOMER
              </TableHead>
              <TableHead className="py-4 font-bold text-black">
                ORDER DATE
              </TableHead>
              <TableHead className="py-4 font-bold text-black">
                STATUS
              </TableHead>
              <TableHead className="py-4 font-bold text-black">
                ITEM RECEIVED
              </TableHead>
              <TableHead className="py-4 font-bold text-black">
                ACTION
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
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
                    : "On Progress"

              return (
                <TableRow
                  key={order.id}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <TableCell className="py-4">
                    <div className="font-bold">{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {totalItems} item -{" "}
                      {formatCurrency(order.totalPrice, order.currency)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-bold">
                      {order.customer?.name || "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer?.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium">
                      {order.orderDate
                        ? format(new Date(order.orderDate), "d/MM/yyyy")
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(displayStatus)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {receivedItems}/{totalItems}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-full border-gray-300 shadow-sm"
                        asChild
                      >
                        <Link href={`/order-management/${order.id}`}>
                          <Eye className="h-3 w-3 text-gray-500" />
                          <span>View Detail</span>
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-full border-gray-300 shadow-sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Pencil className="h-3 w-3 text-gray-500" />
                        <span>Manage</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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

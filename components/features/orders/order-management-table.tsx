/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"

import { format } from "date-fns"
import { Pencil } from "lucide-react"

import { formatCurrency } from "@/lib/utils"

import { StatusBadge } from "@/components/global/status-badge"
import { Button } from "@/components/ui/button"

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

  // Auto-open modal if orderId is in query params (e.g. after refresh)
  useEffect(() => {
    if (isLoading || orders.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get("orderId")
    if (orderId) {
      const found = orders.find((o) => o.id === orderId)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setSelectedOrder(found)
    }
  }, [isLoading, orders])

  const getStatusBadge = (status: string) => {
    return (
      <StatusBadge
        status={status || "Pending"}
        className="h-8! w-28 rounded-full px-4 py-3 text-center"
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-t-[8px] bg-[#F9F9F9]">
        <div className="h-[calc(100vh-150px)] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#F2EDE4]">
              <tr>
                <th className="px-6 py-4 font-medium text-black">ORDER ID</th>
                <th className="px-6 py-4 font-medium text-black">CUSTOMER</th>
                <th className="px-6 py-4 font-medium text-black">ORDER DATE</th>
                <th className="px-6 py-4 font-medium text-black">STATUS</th>
                <th className="px-6 py-4 font-medium text-black">
                  ITEM RECEIVED
                </th>
                <th className="px-6 py-4 font-medium text-black">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/50">
              {isLoading && <OrderManagementTableSkeleton />}
              {!isLoading && !orders.length && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <OrderManagementTableEmpty />
                  </td>
                </tr>
              )}
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
                    <tr
                      key={order.id}
                      className="border-b border-black/10 last:border-0 hover:bg-muted/50"
                    >
                      <td className="gap-1 px-6 py-4 align-middle">
                        <div className="text-base font-medium text-black">
                          #{order.orderNumber}
                        </div>
                        <div className="text-xs text-black/60">
                          {totalItems} item - {formatCurrency(order.totalPrice)}{" "}
                          USD
                        </div>
                      </td>
                      <td className="gap-1 px-6 py-4 align-middle">
                        <div className="text-base font-medium text-black">
                          {order.customer?.name || "-"}
                        </div>
                        <div className="text-xs text-black/60">
                          {order.customer?.email || "-"}
                        </div>
                      </td>
                      <td className="gap-1 px-6 py-4 align-middle">
                        <div className="text-base font-medium text-black">
                          {order.orderDate
                            ? format(new Date(order.orderDate), "d/MM/yyyy")
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        {getStatusBadge(displayStatus)}
                      </td>
                      <td className="gap-1 px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-200">
                            <div
                              className={`h-full rounded-full ${progressBgClass}`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-medium text-xs text-[#3D3D3D]">
                            {receivedItems}/{totalItems}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
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
                      </td>
                    </tr>
                  )
                })}
            </tbody>
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

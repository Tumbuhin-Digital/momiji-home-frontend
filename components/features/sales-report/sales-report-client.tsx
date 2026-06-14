"use client"

import { CloudDownload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useOrders } from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"

export function SalesReportClient() {
  const { data: orders, isLoading, error } = useOrders()

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading sales report...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive">
        Error loading sales report.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-medium text-neutral-800">
            Sales Report
          </h1>
          <p className="text-lg text-neutral-400">History Sales</p>
        </div>
        <Button type="button" size="xl" className="w-full sm:w-fit">
          <CloudDownload className="size-4" />
          Download Excel
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-[#F2EFEA] hover:bg-[#F2EFEA]">
              <TableHead className="rounded-tl-xl px-6 py-4 text-xs font-bold text-[#6D6B69]">
                ORDER ID
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-[#6D6B69]">
                CUSTOMER
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-[#6D6B69]">
                PRODUCT
              </TableHead>
              <TableHead className="rounded-tr-xl px-6 py-4 text-xs font-bold text-[#6D6B69]">
                TOTAL PRICE
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders?.map((order) => {
                const totalItems = order.lineItems.length
                const shipReadyCount = order.lineItems.filter(
                  (item) =>
                    item.type === "ship-ready" ||
                    (!item.type && order.type === "ready")
                ).length
                const preOrderCount = order.lineItems.filter(
                  (item) =>
                    item.type === "pre-order" ||
                    (!item.type && order.type === "pre-order")
                ).length

                const breakdownText = []
                if (shipReadyCount > 0)
                  breakdownText.push(`${shipReadyCount} Ship Ready`)
                if (preOrderCount > 0)
                  breakdownText.push(`${preOrderCount} Pre-Order`)

                return (
                  <TableRow
                    key={order.id}
                    className="border-b-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <TableCell className="px-6 py-4 align-top">
                      <div className="font-bold text-[#2F3E46]">
                        {order.orderNumber}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-[#99A6AA]">
                        {formatOrderDate(order.orderDate)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-top">
                      <div className="font-bold text-[#2F3E46]">
                        {order.customer?.name || "Guest"}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-[#99A6AA]">
                        {order.customer?.email || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-top">
                      <div className="font-bold text-[#2F3E46]">
                        {totalItems} {totalItems === 1 ? "Order" : "Orders"}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-[#99A6AA]">
                        {breakdownText.join(", ") || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-top">
                      <div className="font-bold text-[#2F3E46]">
                        {formatCurrency(order.totalPrice, "$")} {order.currency}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

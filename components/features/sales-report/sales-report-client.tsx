"use client"

import { useState } from "react"

import { CloudDownload, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { SalesReportTableSkeleton } from "@/components/features/sales-report/sales-report-table-skeleton"

import { useOrders } from "@/hooks/use-orders"
import { ordersService } from "@/lib/services"
import { formatCurrency } from "@/lib/utils"

export function SalesReportClient() {
  const { data: orders, isLoading, error } = useOrders()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await ordersService.exportOrders()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "sales_report.xlsx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (e) {
      console.error("Failed to export orders", e)
    } finally {
      setIsExporting(false)
    }
  }

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
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
        <Button
          type="button"
          size="xl"
          className="h-13! w-full sm:w-fit"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CloudDownload className="size-4" />
          )}
          Download Excel
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-t-[8px] bg-[#F9F9F9]">
        <div className="h-[calc(100vh-150px)] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="sticky top-0 z-10 bg-[#F2EDE4] text-black">
              <tr>
                <th className="px-6 py-4 font-medium">ORDER ID</th>
                <th className="px-6 py-4 font-medium">CUSTOMER</th>
                <th className="px-6 py-4 font-medium">PRODUCT</th>
                <th className="px-6 py-4 font-medium">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/50">
              {isLoading && <SalesReportTableSkeleton />}
              {!isLoading && orders?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
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
                    <tr
                      key={order.id}
                      className="border-b border-black/10 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-black">
                          #{order.orderNumber}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-black/60">
                          {formatOrderDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-black">
                          {order.customer?.name || "Guest"}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-black/60">
                          {order.customer?.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-black">
                          {totalItems} {totalItems === 1 ? "Order" : "Orders"}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-black/60">
                          {breakdownText.join(", ") || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-black">
                          {formatCurrency(order.totalPrice)} USD
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

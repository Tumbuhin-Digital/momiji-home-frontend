"use client"

import { useEffect, useRef, useState } from "react"

import { CloudDownload, Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { SalesReportDetailModal } from "@/components/features/sales-report/sales-report-detail-modal"
import { SalesReportTableSkeleton } from "@/components/features/sales-report/sales-report-table-skeleton"

import { useExportOrders, useInfiniteOrders } from "@/hooks/use-orders"
import { formatCurrency, formatLastSynced } from "@/lib/utils"

export function SalesReportClient() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteOrders()

  const orders = data?.pages.flatMap((page) => page.orders) || []
  const totalOrders = data?.pages[0]?.total || 0
  const exportMutation = useExportOrders()
  const observerRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          fetchNextPage
        ) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = observerRef.current
    if (currentRef) observer.observe(currentRef)
    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({})
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const date = new Date()
      const mm = String(date.getMonth() + 1).padStart(2, "0")
      const dd = String(date.getDate()).padStart(2, "0")
      const yyyy = date.getFullYear()

      a.download = `sales_report_${mm}_${dd}_${yyyy}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (e) {
      console.error("Failed to export orders", e)
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
          <p className="text-lg text-neutral-400">
            {formatLastSynced(new Date())} · {totalOrders} sales in total
          </p>
        </div>
        <Button
          type="button"
          size="xl"
          className="h-13! w-full sm:w-fit"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? (
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
          <table className="w-full min-w-225 text-left text-sm text-slate-600">
            <thead className="sticky top-0 z-10 bg-[#F2EDE4] text-black">
              <tr>
                <th className="px-6 py-4 font-medium text-black">ORDER ID</th>
                <th className="px-6 py-4 font-medium text-black">CUSTOMER</th>
                <th className="px-6 py-4 font-medium text-black">PRODUCT</th>
                <th className="px-6 py-4 font-medium text-black">
                  TOTAL PRICE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/50">
              {isLoading && <SalesReportTableSkeleton />}
              {!isLoading && orders?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-0">
                    <div className="flex h-[calc(100vh-360px)] items-center justify-center">
                      <Empty className="gap-4 border-none">
                        <EmptyMedia variant="icon" className="mb-0">
                          <Search className="size-5 text-primary" />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>No orders found</EmptyTitle>
                          <EmptyDescription>
                            There are no orders matching your criteria.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </div>
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
                      <td className="gap-1 px-6 py-4 align-middle whitespace-nowrap">
                        <div
                          className="cursor-pointer text-base font-medium text-primary hover:underline"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          #{order.orderNumber}
                        </div>
                        <div className="text-xs text-black/60">
                          {formatOrderDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="gap-1 px-6 py-4 align-middle">
                        <div className="text-base font-medium text-black">
                          {order.customer?.name || "Guest"}
                        </div>
                        <div className="text-xs text-black/60">
                          {order.customer?.email || "-"}
                        </div>
                      </td>
                      <td className="gap-1 px-6 py-4 align-middle">
                        <div className="text-base font-medium text-black">
                          {totalItems} {totalItems === 1 ? "Order" : "Orders"}
                        </div>
                        <div className="text-xs text-black/60">
                          {breakdownText.join(", ") || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="text-base font-medium text-[#3D3D3D]">
                          {formatCurrency(order.totalPrice)} USD
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              {hasNextPage && (
                <tr ref={observerRef}>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-neutral-500"
                  >
                    {isFetchingNextPage ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span>Loading more reports...</span>
                      </div>
                    ) : (
                      "Scroll down to load more"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrderId && (
        <SalesReportDetailModal
          orderId={selectedOrderId}
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  )
}

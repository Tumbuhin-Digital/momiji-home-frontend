"use client"

import Link from "next/link"

import { AlignLeft, ArrowRight, BarChart3, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toastManager } from "@/components/ui/toast"

import { Iconsax3dRotate } from "@/public/icons/iconsax-3d-rotate"

import { useDashboardSummary } from "@/hooks/use-dashboard"
import { useForceSync } from "@/hooks/use-sync"
import { formatCurrency, formatSystemStatus } from "@/lib/utils"

export default function DashboardClient() {
  const { data, isLoading } = useDashboardSummary()
  const forceSyncMutation = useForceSync()

  const isSyncing = forceSyncMutation.isPending

  const handleSync = async () => {
    try {
      await forceSyncMutation.mutateAsync()
      toastManager.add({
        title: "Success",
        description: "Products synced successfully",
        type: "success",
      })
    } catch {}
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-medium text-neutral-800">
            Operations Dashboard
          </h1>
          <p className="text-lg text-neutral-400">
            {formatSystemStatus(new Date())}
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="h-10! w-full gap-1.5 rounded-full border-none bg-primary/20 px-4 py-2 text-primary hover:bg-primary/30 hover:text-primary sm:w-fit"
        >
          <Iconsax3dRotate
            className={`size-6 ${isSyncing ? "animate-spin" : ""}`}
          />
          <span className="text-sm">Syncing Shopify Product</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Total Products
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  {isLoading ? "-" : (data?.statCards.totalProducts ?? 0)}
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <Lock className="size-5 text-slate-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Synced - <span className="text-emerald-500">Shopify</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Available Stock
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  {isLoading
                    ? "-"
                    : (data?.statCards.availableStock.count ?? 0)}
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <Lock className="size-5 text-slate-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Stock update -{" "}
              <span className="text-emerald-500">
                {isLoading
                  ? "-"
                  : `+${data?.statCards.availableStock.deltaToday ?? 0} today`}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Order in Progress
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  {isLoading
                    ? "-"
                    : (data?.statCards.ordersInProgress.count ?? 0)}
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <Lock className="size-5 text-slate-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Pending Pickup -{" "}
              <span className="text-emerald-500">
                {isLoading
                  ? "-"
                  : `${data?.statCards.ordersInProgress.deltaToday ?? 0} today`}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Pre-Orders
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  {isLoading ? "-" : (data?.statCards.preOrders.count ?? 0)}
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <Lock className="size-5 text-slate-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Awaiting -{" "}
              <span className="text-amber-500">
                {isLoading
                  ? "-"
                  : data?.statCards.preOrders.statusLabel || "Confirm Pending"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-2">
              <AlignLeft className="size-5 text-slate-800" />
              <h3 className="text-lg font-medium text-slate-800">
                Recent Order Queue
              </h3>
            </div>
            <Link href="/order-management">
              <button className="flex items-center gap-1 text-sm font-medium text-[#8CAEBA] transition-colors hover:text-[#6A8A96]">
                Manage All <ArrowRight className="size-4" />
              </button>
            </Link>
          </div>
          <CardContent className="flex flex-col gap-4 p-6">
            {isLoading ? (
              <div className="text-sm text-slate-500">Loading orders...</div>
            ) : !data?.recentOrders.length ? (
              <div className="text-sm text-slate-500">No recent orders.</div>
            ) : (
              data.recentOrders.map((order, i) => {
                const isNew = order.statusLabel.toLowerCase() === "new order"
                const isPre = order.statusLabel.toLowerCase().includes("pre")

                let badgeClass = "bg-slate-100 text-slate-600"
                if (isNew) badgeClass = "bg-blue-100 text-blue-600"
                else if (isPre) badgeClass = "bg-orange-100 text-orange-600"
                else if (order.statusLabel.toLowerCase().includes("confirm"))
                  badgeClass = "bg-emerald-100 text-emerald-600"

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-[#A5C1CB] bg-[#E8EFEF] p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-slate-500">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.itemsPreview}
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${badgeClass}`}
                    >
                      {order.statusLabel}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-slate-800" />
              <h3 className="text-lg font-medium text-slate-800">
                Sales Report
              </h3>
            </div>
            <Link href="/sales-report">
              <button className="flex items-center gap-1 text-sm font-medium text-[#8CAEBA] transition-colors hover:text-[#6A8A96]">
                Details <ArrowRight className="size-4" />
              </button>
            </Link>
          </div>
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between rounded-lg border border-[#A5C1CB] bg-[#E8EFEF] p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Total Revenue
                </p>
                <h3 className="text-3xl font-bold text-[#553E2A]">
                  {isLoading
                    ? "-"
                    : `${formatCurrency(data?.salesReport.totalRevenueThisMonth ?? 0)} ${data?.salesReport.currency || "USD"}`}
                </h3>
                <p className="text-[11px] font-medium text-slate-800">
                  This Month
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <BarChart3 className="size-5 text-slate-400" />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#8CAEBA]">
                  Monthly Revenue
                </h4>
                <div className="ml-4 h-px flex-1 bg-slate-200" />
              </div>
              <div className="mt-8 flex h-40 items-end justify-between px-2">
                {(() => {
                  if (isLoading || !data) return null
                  const maxRevenue = Math.max(
                    ...data.salesReport.monthlyRevenue.map((m) => m.revenue),
                    1 // avoid divide by zero
                  )
                  return data.salesReport.monthlyRevenue.map((col) => {
                    const h = `${Math.max((col.revenue / maxRevenue) * 100, 2)}%`
                    const hasValue = col.revenue > 0

                    return (
                      <div
                        key={col.month}
                        className="relative flex w-6 flex-col items-center gap-2"
                      >
                        {hasValue && (
                          <div className="absolute -top-10 z-10 rounded-md bg-white px-3 py-1.5 text-[10px] font-semibold whitespace-nowrap text-[#8CAEBA] shadow-sm ring-1 ring-slate-200">
                            {formatCurrency(col.revenue)}{" "}
                            {data.salesReport.currency}
                          </div>
                        )}
                        <div
                          className="w-full rounded-sm bg-[#8CAEBA] transition-all hover:bg-[#6A8A96]"
                          style={{ height: h }}
                        />
                        <span className="text-[10px] font-medium text-slate-800">
                          {col.month}
                        </span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

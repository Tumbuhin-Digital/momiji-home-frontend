"use client"

import Link from "next/link"

import { ArrowRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { toastManager } from "@/components/ui/toast"

import { StatusBadge } from "@/components/global/status-badge"

import { DashboardSkeleton } from "./dashboard-skeleton"

import { IconlyBag } from "@/public/icons/iconly-bag"
import { IconlyChart } from "@/public/icons/iconly-chart"
import { Iconsax3dRotate } from "@/public/icons/iconsax-3d-rotate"

import { useDashboardSummary } from "@/hooks/use-dashboard"
import { useForceSync } from "@/hooks/use-sync"
import { formatCurrency, formatSystemStatus } from "@/lib/utils"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#8CAEBA",
  },
} satisfies ChartConfig

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

      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-[8px] border-primary bg-secondary shadow-none">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#202939]">Total Products</p>
                    <div className="flex flex-col gap-2.5">
                      <h2 className="text-[32px] font-semibold text-[#341601]">
                        {isLoading ? "-" : (data?.statCards.totalProducts ?? 0)}
                      </h2>
                      <p className="text-xs font-medium text-[#341601]">
                        Synced - <span className="text-[#34C759]">Shopify</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex size-10.5 items-center justify-center rounded-full bg-primary/20">
                    <IconlyBag className="size-5.5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[8px] border-primary bg-secondary shadow-none">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#202939]">
                      Available Stock
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <h2 className="text-[32px] font-semibold text-[#341601]">
                        {isLoading
                          ? "-"
                          : (data?.statCards.availableStock.count ?? 0)}
                      </h2>
                      <p className="text-xs font-medium text-[#341601]">
                        Stock update -{" "}
                        <span className="text-[#34C759]">
                          {isLoading
                            ? "-"
                            : `+${data?.statCards.availableStock.deltaToday ?? 0} today`}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex size-10.5 items-center justify-center rounded-full bg-primary/20">
                    <IconlyBag className="size-5.5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[8px] border-primary bg-secondary shadow-none">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#202939]">
                      Order in Progress
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <h2 className="text-[32px] font-semibold text-[#341601]">
                        {isLoading
                          ? "-"
                          : (data?.statCards.ordersInProgress.count ?? 0)}
                      </h2>
                      <p className="text-xs font-medium text-[#341601]">
                        Pending Pickup -{" "}
                        <span className="text-[#34C759]">
                          {isLoading
                            ? "-"
                            : `${data?.statCards.ordersInProgress.deltaToday ?? 0} today`}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex size-10.5 items-center justify-center rounded-full bg-primary/20">
                    <IconlyBag className="size-5.5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[8px] border-primary bg-secondary shadow-none">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#202939]">Pre-Orders</p>
                    <div className="flex flex-col gap-2.5">
                      <h2 className="text-[32px] font-semibold text-[#341601]">
                        {isLoading
                          ? "-"
                          : (data?.statCards.preOrders.count ?? 0)}
                      </h2>
                      <p className="text-xs font-medium text-[#341601]">
                        Awaiting -{" "}
                        <span className="text-[#FF8D28]">
                          {isLoading
                            ? "-"
                            : data?.statCards.preOrders.statusLabel ||
                              "Confirm Pending"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex size-10.5 items-center justify-center rounded-full bg-primary/20">
                    <IconlyBag className="size-5.5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="gap-3 rounded-[8px] border-primary bg-secondary shadow-none">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                  <IconlyChart className="size-6 text-black" />
                  <h3 className="text-xl font-medium text-black">
                    Recent Order Queue
                  </h3>
                </div>
                <Link href="/order-management">
                  <button className="flex cursor-pointer items-center gap-1 text-lg font-medium text-primary transition-colors hover:text-[#6A8A96]">
                    Manage All <ArrowRight className="size-6" />
                  </button>
                </Link>
              </div>
              <CardContent className="space-y-3 pt-0">
                {isLoading ? (
                  <div className="text-sm text-slate-500">
                    Loading orders...
                  </div>
                ) : !data?.recentOrders.length ? (
                  <div className="text-sm text-slate-500">
                    No recent orders.
                  </div>
                ) : (
                  data.recentOrders.slice(0, 4).map((order, i) => {
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-1.75 rounded-[8px] border border-primary bg-primary/20 p-3"
                      >
                        <div>
                          <p className="text-xs font-medium text-[#202939]">
                            #{order.orderNumber}
                          </p>
                          <span className="flex flex-col gap-1">
                            <p className="text-lg font-semibold text-[#341601]">
                              {order.customerName}
                            </p>
                            <p className="text-sm text-alternate">
                              {order.itemsPreview}
                            </p>
                          </span>
                        </div>
                        <StatusBadge
                          status={order.statusLabel}
                          className="h-8! w-fit rounded-full px-4 py-3 text-center"
                        />
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <Card className="gap-3 rounded-[8px] border-primary bg-secondary shadow-none">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                  <IconlyChart className="size-6 text-black" />
                  <h3 className="text-xl font-medium text-black">
                    Sales Report
                  </h3>
                </div>
                <Link href="/sales-report">
                  <button className="flex cursor-pointer items-center gap-1 text-lg font-medium text-primary transition-colors hover:text-[#6A8A96]">
                    Details <ArrowRight className="size-6" />
                  </button>
                </Link>
              </div>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between gap-1.75 rounded-[8px] border border-primary bg-primary/20 p-4">
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <p className="font-medium text-[#202939]">
                        Total Revenue
                      </p>
                      <span className="flex flex-col gap-2">
                        <h3 className="text-[32px] font-semibold text-[#341601]">
                          {isLoading
                            ? "-"
                            : `${formatCurrency(data?.salesReport.totalRevenueThisMonth ?? 0)} ${data?.salesReport.currency || "USD"}`}
                        </h3>
                        <p className="text-xs font-medium text-[#341601]">
                          This Month
                        </p>
                      </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/20">
                      <IconlyChart className="size-5 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center justify-between gap-2.5">
                    <h4 className="text-xl font-medium text-primary">
                      Monthly Revenue
                    </h4>
                    <div className="h-px flex-1 bg-primary" />
                  </div>
                  <div>
                    {isLoading || !data ? (
                      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                        Loading chart...
                      </div>
                    ) : (
                      <ChartContainer
                        config={chartConfig}
                        className="h-57 w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={data.salesReport.monthlyRevenue}
                        >
                          <CartesianGrid vertical={false} horizontal={false} />
                          <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tick={{
                              fill: "#000000",
                              fontSize: 14,
                              fontWeight: 500,
                            }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-sm bg-white px-3 py-1.5 text-[10px] font-semibold whitespace-nowrap text-primary shadow-sm ring-1 ring-slate-200">
                                    {data.salesReport.currency}{" "}
                                    {formatCurrency(payload[0].value as number)}
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="var(--color-revenue)"
                            radius={[4, 4, 0, 0]}
                            barSize={24}
                          />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

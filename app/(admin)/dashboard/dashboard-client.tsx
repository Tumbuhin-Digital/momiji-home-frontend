"use client"

import { Lock, AlignLeft, BarChart3, ArrowRight } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent } from "@/components/ui/card"

export default function DashboardClient() {
  const currentDate = format(new Date(), "EEEE, MMM dd yyyy")

  return (
    <div className="flex flex-col gap-6 p-8 lg:p-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[28px] font-medium text-slate-800">
          Operations Dashboard
        </h1>
        <p className="text-[15px] text-slate-400">
          {currentDate} - All System Running
        </p>
      </div>

      {/* 4 Top Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Total Products
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  148
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

        {/* Card 2 */}
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Available Stock
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  112
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <Lock className="size-5 text-slate-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Stock update - <span className="text-emerald-500">+12 today</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Order in Progress
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  27
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <Lock className="size-5 text-slate-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Pending Pickup - <span className="text-emerald-500">8 today</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-slate-700">
                  Pre-Orders
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-800">
                  3
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-200/50">
                <Lock className="size-5 text-slate-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Awaiting - <span className="text-amber-500">Confirm Pending</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Split Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Recent Order Queue */}
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-2">
              <AlignLeft className="size-5 text-slate-800" />
              <h3 className="text-lg font-medium text-slate-800">
                Recent Order Queue
              </h3>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-[#8CAEBA] transition-colors hover:text-[#6A8A96]">
              Manage All <ArrowRight className="size-4" />
            </button>
          </div>
          <CardContent className="flex flex-col gap-4 p-6">
            {[
              {
                id: "#ORD-1091",
                name: "James Bay",
                desc: "3-in-1 Grocery Store, Shop Stall & Study Desk (1pcs)",
                badge: "New Order",
                badgeClass: "bg-blue-100 text-blue-600",
              },
              {
                id: "#ORD-1091",
                name: "James Bay",
                desc: "3-in-1 Grocery Store, Shop Stall & Study Desk (1pcs)",
                badge: "Pre-Order",
                badgeClass: "bg-orange-100 text-orange-600",
              },
              {
                id: "#ORD-1091",
                name: "James Bay",
                desc: "3-in-1 Grocery Store, Shop Stall & Study Desk (1pcs)",
                badge: "Order Confirm",
                badgeClass: "bg-emerald-100 text-emerald-600",
              },
              {
                id: "#ORD-1091",
                name: "James Bay",
                desc: "3-in-1 Grocery Store, Shop Stall & Study Desk (1pcs)",
                badge: "Pre-Order",
                badgeClass: "bg-orange-100 text-orange-600",
              },
            ].map((order, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-[#A5C1CB] bg-[#E8EFEF] p-4"
              >
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-500">
                    {order.id}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {order.name}
                  </p>
                  <p className="text-xs text-slate-500">{order.desc}</p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${order.badgeClass}`}
                >
                  {order.badge}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column: Sales Report */}
        <Card className="rounded-[12px] border-slate-200/60 bg-[#FFFAF0] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-slate-800" />
              <h3 className="text-lg font-medium text-slate-800">
                Sales Report
              </h3>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-[#8CAEBA] transition-colors hover:text-[#6A8A96]">
              Details <ArrowRight className="size-4" />
            </button>
          </div>
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between rounded-lg border border-[#A5C1CB] bg-[#E8EFEF] p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Total Revenue
                </p>
                <h3 className="text-3xl font-bold text-[#553E2A]">
                  $ 1,500 USD
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

              {/* Simple Bar Chart Mockup */}
              <div className="mt-8 flex h-40 items-end justify-between px-2">
                {[
                  { label: "Jan", h: "4%" },
                  { label: "Feb", h: "12%" },
                  { label: "Mar", h: "0%" },
                  { label: "Apr", h: "0%" },
                  { label: "May", h: "0%" },
                  { label: "Jun", h: "0%" },
                  { label: "Jul", h: "55%", value: "USD 1,000" },
                  { label: "Aug", h: "75%" },
                  { label: "Sept", h: "45%" },
                  { label: "Oct", h: "0%" },
                  { label: "Nov", h: "0%" },
                  { label: "Dec", h: "0%" },
                ].map((col) => (
                  <div
                    key={col.label}
                    className="relative flex w-6 flex-col items-center gap-2"
                  >
                    {col.value && (
                      <div className="absolute -top-10 z-10 rounded-md bg-white px-3 py-1.5 text-[10px] font-semibold whitespace-nowrap text-[#8CAEBA] shadow-sm ring-1 ring-slate-200">
                        {col.value}
                      </div>
                    )}
                    <div
                      className="w-full rounded-sm bg-[#8CAEBA] transition-all hover:bg-[#6A8A96]"
                      style={{ height: col.h }}
                    />
                    <span className="text-[10px] font-medium text-slate-800">
                      {col.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

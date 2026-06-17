"use client"

import { useState } from "react"

import { format } from "date-fns"
import { Download, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { InvoiceSettlementModal } from "@/components/features/preorders/invoice-settlement-modal"
import { PaidSettlementModal } from "@/components/features/preorders/paid-settlement-modal"

import { useExportPreorders, usePreorders } from "@/hooks/use-preorders"
import { formatCurrency } from "@/lib/utils"

import type { PreorderGroupSettlement } from "@/types/preorders"

type SortOption = "A-Z" | "Qty: low-high" | "Qty: high-low"

export function PreorderListClient() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption | null>(null)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    settlement: PreorderGroupSettlement | null
    type: "invoice" | "paid" | null
  }>({
    isOpen: false,
    settlement: null,
    type: null,
  })

  const { data: groups, isLoading } = usePreorders({ page, limit: 20 })
  const exportMutation = useExportPreorders()

  const currentDateStr = format(new Date(), "EEEE, MMM d yyyy")

  const filteredGroups = groups
    ?.filter((g) =>
      g.productName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    ?.sort((a, b) => {
      if (sortBy === "A-Z") return a.productName.localeCompare(b.productName)
      if (sortBy === "Qty: low-high") return a.totalQuantity - b.totalQuantity
      if (sortBy === "Qty: high-low") return b.totalQuantity - a.totalQuantity
      return 0
    })

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({})
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "preorder_list.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // error silently handled
    }
  }

  const toggleSort = (option: SortOption) => {
    setSortBy((prev) => (prev === option ? null : option))
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Pre-Order List
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentDateStr} - All System Running
          </p>
        </div>

        <Button
          variant="secondary"
          className="bg-[#7EA4B3] font-medium text-white hover:bg-[#688A98]"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          {exportMutation.isPending ? "Downloading..." : "Download Excel"}
        </Button>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search Product"
            className="rounded border border-slate-200 pl-9 text-sm shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="shrink-0 gap-2 rounded border-slate-200 text-slate-600"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 rounded bg-white p-2 shadow-lg"
          >
            <DropdownMenuCheckboxItem
              checked={sortBy === "A-Z"}
              onCheckedChange={() => toggleSort("A-Z")}
              className="cursor-pointer rounded py-2"
            >
              A-Z
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortBy === "Qty: low-high"}
              onCheckedChange={() => toggleSort("Qty: low-high")}
              className="cursor-pointer rounded py-2"
            >
              Qty: low-high
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortBy === "Qty: high-low"}
              onCheckedChange={() => toggleSort("Qty: high-low")}
              className="cursor-pointer rounded py-2"
            >
              Qty: high-low
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded border border-[#EBEBEB] bg-white shadow-sm"
              >
                {/* Group header skeleton */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-3.5 w-16 rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-7 w-12 rounded" />
                  </div>
                </div>
                {/* Row skeleton */}
                <div className="divide-y divide-slate-100 px-6">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-8 py-3">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : !filteredGroups || filteredGroups.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded border border-dashed border-slate-200 bg-white text-sm text-muted-foreground">
            No pre-order groups found.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.productName}
              className="overflow-hidden rounded border border-[#EBEBEB] bg-white shadow-sm"
            >
              {/* Group header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {group.productName}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {group.settlements.length} Order
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                    Total Quantity
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {group.totalQuantity}
                  </p>
                </div>
              </div>

              {/* Settlement rows */}
              <div className="divide-y divide-slate-100">
                {/* Column labels */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50 px-6 py-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  <span>Order ID</span>
                  <span>Date</span>
                  <span>Quantity</span>
                </div>

                {group.settlements.map((s) => (
                  <div
                    key={s.settlementId}
                    className="grid grid-cols-3 items-center gap-4 px-6 py-3 transition-colors hover:bg-slate-50/60"
                  >
                    <span
                      className="cursor-pointer font-medium text-slate-800 hover:text-primary hover:underline"
                      onClick={() =>
                        setConfirmModal({
                          isOpen: true,
                          settlement: s,
                          type:
                            s.settlementStatus === "pending"
                              ? "invoice"
                              : s.settlementStatus === "invoiced"
                                ? "paid"
                                : null,
                        })
                      }
                    >
                      {s.orderNumber}
                    </span>
                    <span className="text-sm text-slate-600">
                      {s.dueDate
                        ? format(new Date(s.dueDate), "M/d/yyyy")
                        : "-"}
                    </span>
                    <span className="text-sm text-slate-600">
                      {formatCurrency(parseFloat(s.balanceDue))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filteredGroups && filteredGroups.length > 0 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!groups || groups.length < 20}
            className="rounded"
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {confirmModal.settlement && confirmModal.type === "invoice" && (
        <InvoiceSettlementModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, settlement: null, type: null })
          }
          settlementId={confirmModal.settlement.settlementId}
          orderId={confirmModal.settlement.orderId}
        />
      )}
      {confirmModal.settlement && confirmModal.type === "paid" && (
        <PaidSettlementModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, settlement: null, type: null })
          }
          settlementId={confirmModal.settlement.settlementId}
          orderId={confirmModal.settlement.orderId}
        />
      )}
    </div>
  )
}

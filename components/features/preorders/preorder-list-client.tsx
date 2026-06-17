"use client"

import { useState } from "react"

import { format } from "date-fns"
import {
  CloudDownload,
  ListFilter,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"

import { InvoiceSettlementModal } from "@/components/features/preorders/invoice-settlement-modal"
import { PaidSettlementModal } from "@/components/features/preorders/paid-settlement-modal"

import { useExportPreorders, usePreorders } from "@/hooks/use-preorders"
import { formatCurrency, formatSystemStatus } from "@/lib/utils"

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
    } catch (e) {
      console.error("Failed to export orders", e)
    }
  }

  const toggleSort = (option: SortOption) => {
    setSortBy((prev) => (prev === option ? null : option))
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
            {formatSystemStatus(new Date())}
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

      {/* Search + Sort */}
      <div className="flex items-center gap-2">
        <InputGroup className="h-11 flex-1 rounded-[8px] border-primary shadow-sm has-[input:focus-visible]:border-primary/20 has-[input:focus-visible]:ring-primary/20">
          <InputGroupAddon>
            <div className="flex size-6 items-center justify-center gap-2 rounded-full bg-primary/20">
              <Search
                className="size-3 text-primary"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </div>
          </InputGroupAddon>
          <InputGroupInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Product"
            className="text-sm"
          />
        </InputGroup>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11! gap-2 rounded-[6px] border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-600"
              >
                <ListFilter className="size-5" strokeWidth={1.5} />
                Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl bg-white shadow-lg"
            >
              <DropdownMenuCheckboxItem
                checked={sortBy === "A-Z"}
                onCheckedChange={() => toggleSort("A-Z")}
              >
                A-Z
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "Qty: low-high"}
                onCheckedChange={() => toggleSort("Qty: low-high")}
              >
                Qty: low-high
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "Qty: high-low"}
                onCheckedChange={() => toggleSort("Qty: high-low")}
              >
                Qty: high-low
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {(searchQuery || sortBy) && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchQuery("")
                setSortBy(null)
                setPage(1)
              }}
              className="size-11! gap-2 rounded-[6px] border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-600"
            >
              <RotateCcw className="size-5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
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

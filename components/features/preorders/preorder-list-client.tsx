"use client"

import { useState } from "react"

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { StatusBadge } from "@/components/global/status-badge"

import { PreorderListSkeleton } from "@/components/features/preorders/preorder-list-skeleton"
import { SettlementActionModal } from "@/components/features/preorders/settlement-action-modal"

import { useExportPreorders, usePreorders } from "@/hooks/use-preorders"
import { formatLastSynced } from "@/lib/utils"

import { parseAsInteger, useQueryState } from "nuqs"

import type { SettlementStatus } from "@/types/preorders"

type SortOption = "A-Z" | "Qty: low-high" | "Qty: high-low"
type StatusFilter = SettlementStatus | "all"

const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  pending: "Pending",
  invoiced: "Invoiced",
  paid: "Paid",
}

const pageParser = parseAsInteger.withDefault(1)

export function PreorderListClient() {
  const [page, setPage] = useQueryState("page", pageParser)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean
    settlementId: string
    orderNumber: string
  }>({
    isOpen: false,
    settlementId: "",
    orderNumber: "",
  })

  const limit = 10
  const { data: queryData, isLoading } = usePreorders({
    page,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const groups = queryData?.data
  const total = queryData?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
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

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({})
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const date = new Date()
      const mm = String(date.getMonth() + 1).padStart(2, "0")
      const dd = String(date.getDate()).padStart(2, "0")
      const yyyy = date.getFullYear()

      a.download = `preorder_list_${mm}_${dd}_${yyyy}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Failed to export orders", e)
    }
  }

  const handleRowClick = (settlementId: string, orderNumber: string) => {
    setActionModal({ isOpen: true, settlementId, orderNumber })
  }

  const toggleSort = (option: SortOption) => {
    setSortBy((prev) => (prev === option ? null : option))
  }

  const hasActiveFilter = !!(searchQuery || sortBy || statusFilter !== "all")
  const isFilterActive = sortBy !== null || statusFilter !== "all"

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-medium text-neutral-800">
            Pre-Order List
          </h1>
          <p className="text-lg text-neutral-400">
            {formatLastSynced(new Date())} · {total} pre-orders in total
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

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <InputGroup className="h-11 flex-1 rounded-md border-primary shadow-sm has-[input:focus-visible]:border-primary/20 has-[input:focus-visible]:ring-primary/20">
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
                className={`h-11! gap-2 rounded-sm border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-600 ${isFilterActive ? "border-primary text-primary" : ""}`}
              >
                <ListFilter className="size-5" strokeWidth={1.5} />
                Filter
                {isFilterActive && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {(sortBy ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-xl bg-white shadow-lg"
            >
              {/* Sort section */}
              <DropdownMenuLabel className="text-xs font-semibold text-neutral-400 uppercase">
                Sort By
              </DropdownMenuLabel>
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

              <DropdownMenuSeparator />

              {/* Status filter section */}
              <DropdownMenuLabel className="text-xs font-semibold text-neutral-400 uppercase">
                Status
              </DropdownMenuLabel>
              {(["all", "pending", "invoiced", "paid"] as StatusFilter[]).map(
                (s) => (
                  <DropdownMenuCheckboxItem
                    key={s}
                    checked={statusFilter === s}
                    onCheckedChange={() => {
                      setStatusFilter(s)
                      setPage(1)
                    }}
                  >
                    {s === "all"
                      ? "All"
                      : SETTLEMENT_STATUS_LABEL[s as SettlementStatus]}
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilter && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchQuery("")
                setSortBy(null)
                setStatusFilter("all")
                setPage(1)
              }}
              className="size-11! rounded-sm border-neutral-300 bg-white text-neutral-600"
            >
              <RotateCcw className="size-4" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {isLoading ? (
          <PreorderListSkeleton />
        ) : !filteredGroups || filteredGroups.length === 0 ? (
          <div className="flex h-[calc(100vh-360px)] items-center justify-center rounded border border-dashed border-slate-200 bg-white">
            <Empty className="gap-4 border-none">
              <EmptyMedia variant="icon" className="mb-0">
                <Search className="size-5 text-primary" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No pre-orders found</EmptyTitle>
                <EmptyDescription>
                  No pre-order groups matching your criteria.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.productName}
              className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] shadow-none"
            >
              {/* Group header */}
              <div className="flex items-start justify-between px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0 flex-1 pr-4">
                  <h3 className="text-base font-bold text-[#1A1A1A] sm:text-lg">
                    {group.productName}
                  </h3>
                  <p className="mt-0.5 text-sm text-[#888888]">
                    {group.settlements.length} Order
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-[#888888]">
                    Total Quantity
                  </p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">
                    {group.totalQuantity}
                  </p>
                </div>
              </div>

              {/* Settlement table */}
              <div className="mx-4 mb-4 overflow-hidden rounded-md border border-[#E5E5E5] bg-white">
                {/* Column labels */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr] gap-2 border-b border-[#F0F0F0] px-3 py-2.5 sm:grid-cols-4 sm:gap-4 sm:px-5">
                  <span className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase sm:text-[11px]">
                    Order ID
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase sm:text-[11px]">
                    Pre-order Date
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase sm:text-[11px]">
                    Quantity
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase sm:text-[11px]">
                    Status
                  </span>
                </div>

                {/* Settlement rows */}
                {group.settlements.map((s, idx) => (
                  <div
                    key={s.settlementId}
                    className={`grid cursor-pointer grid-cols-[2fr_2fr_1fr_1.5fr] items-center gap-2 px-3 py-3 transition-colors hover:bg-[#FAFAFA] sm:grid-cols-4 sm:gap-4 sm:px-5 ${
                      idx !== group.settlements.length - 1
                        ? "border-b border-[#F0F0F0]"
                        : ""
                    }`}
                    onClick={() =>
                      handleRowClick(s.settlementId, `#${s.orderNumber}`)
                    }
                  >
                    <span className="text-xs font-medium text-primary hover:underline sm:text-sm">
                      #{s.orderNumber}
                    </span>
                    <span className="text-xs text-[#555555] sm:text-sm">
                      {formatOrderDate(s.createdAt ? s.createdAt : s.dueDate)}
                    </span>
                    <span className="text-xs text-[#555555] sm:text-sm">
                      {s.quantity}
                    </span>
                    <span>
                      <StatusBadge
                        status={
                          SETTLEMENT_STATUS_LABEL[s.settlementStatus] ||
                          s.settlementStatus
                        }
                        className="h-6! w-fit rounded-full px-2 py-1 text-[10px] sm:h-7! sm:px-3 sm:py-1.5 sm:text-xs"
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                    isActive={page === p}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Unified Settlement Action Modal */}
      <SettlementActionModal
        isOpen={actionModal.isOpen}
        settlementId={actionModal.settlementId}
        orderNumber={actionModal.orderNumber}
        onClose={() =>
          setActionModal({ isOpen: false, settlementId: "", orderNumber: "" })
        }
      />
    </div>
  )
}

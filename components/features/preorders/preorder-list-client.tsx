"use client"

import Link from "next/link"
import { useState } from "react"

import { format } from "date-fns"
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Mail,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useInvoiceSettlement,
  usePaidSettlement,
  usePreorders,
} from "@/hooks/use-preorders"
import { formatCurrency } from "@/lib/utils"

export function PreorderListClient() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "invoiced" | "paid" | undefined
  >(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<
    "A-Z" | "Qty: low-high" | "Qty: high-low" | null
  >(null)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: "invoice" | "paid" | null
    id: string | null
  }>({
    isOpen: false,
    type: null,
    id: null,
  })

  const { data: preorders, isLoading } = usePreorders({
    page,
    limit: 10,
    status: statusFilter,
  })

  const invoiceMutation = useInvoiceSettlement()
  const paidMutation = usePaidSettlement()

  const currentDateStr = format(new Date(), "EEEE, MMM d yyyy")

  // Frontend search filter if they type Order ID
  const filteredPreorders = preorders
    ?.filter((p) => p.orderId.toLowerCase().includes(searchQuery.toLowerCase()))
    ?.sort((a, b) => {
      if (sortBy === "A-Z") {
        return a.orderId.localeCompare(b.orderId)
      } else if (sortBy === "Qty: low-high") {
        return a.balanceAmount - b.balanceAmount
      } else if (sortBy === "Qty: high-low") {
        return b.balanceAmount - a.balanceAmount
      }
      return 0
    })

  const handleAction = () => {
    if (!confirmModal.type) return

    if (confirmModal.type === "invoice" && confirmModal.id) {
      invoiceMutation.mutate(confirmModal.id, {
        onSuccess: () =>
          setConfirmModal({ isOpen: false, type: null, id: null }),
      })
    } else if (confirmModal.type === "paid" && confirmModal.id) {
      paidMutation.mutate(confirmModal.id, {
        onSuccess: () =>
          setConfirmModal({ isOpen: false, type: null, id: null }),
      })
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Header section matching design */}
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
        >
          <Download className="mr-2 h-4 w-4" />
          Download Excel
        </Button>
      </div>

      {/* Toolbar section matching design */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search Order ID"
            className="border-none pl-9 text-sm shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mx-2 hidden h-8 w-px bg-slate-200 sm:block"></div>

        <div className="flex shrink-0 gap-2 overflow-x-auto px-2">
          {/* Quick filters mapped as alternative to "Sort By" or in addition */}
          <Button
            variant={statusFilter === undefined ? "default" : "outline"}
            onClick={() => {
              setStatusFilter(undefined)
              setPage(1)
            }}
            className="h-9 rounded-full text-xs"
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => {
              setStatusFilter("pending")
              setPage(1)
            }}
            className="h-9 rounded-full text-xs"
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "invoiced" ? "default" : "outline"}
            onClick={() => {
              setStatusFilter("invoiced")
              setPage(1)
            }}
            className="h-9 rounded-full text-xs"
            size="sm"
          >
            Invoiced
          </Button>
          <Button
            variant={statusFilter === "paid" ? "default" : "outline"}
            onClick={() => {
              setStatusFilter("paid")
              setPage(1)
            }}
            className="h-9 rounded-full text-xs"
            size="sm"
          >
            Paid
          </Button>
        </div>

        <div className="mx-2 hidden h-8 w-px bg-slate-200 sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 shrink-0 gap-2 border border-slate-200 px-4 text-slate-600"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
            <DropdownMenuCheckboxItem
              checked={sortBy === "A-Z"}
              onCheckedChange={() => setSortBy(sortBy === "A-Z" ? null : "A-Z")}
              className="cursor-pointer py-2"
            >
              A-Z
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortBy === "Qty: low-high"}
              onCheckedChange={() =>
                setSortBy(sortBy === "Qty: low-high" ? null : "Qty: low-high")
              }
              className="cursor-pointer py-2"
            >
              Qty: low-high
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortBy === "Qty: high-low"}
              onCheckedChange={() =>
                setSortBy(sortBy === "Qty: high-low" ? null : "Qty: high-low")
              }
              className="cursor-pointer py-2"
            >
              Qty: high-low
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content section */}
      <div className="mt-2 space-y-6">
        <div className="overflow-hidden rounded-xl border border-[#EBEBEB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Settlements Overview
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                Track and manage deposits for pre-orders
              </p>
            </div>
          </div>

          <div className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50/50 text-xs font-medium tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-500">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-500">
                    Balance
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skel-${idx}`}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="ml-auto h-4 w-16" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="ml-auto h-8 w-28 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : !filteredPreorders || filteredPreorders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No pre-order settlements found.
                    </td>
                  </tr>
                ) : (
                  filteredPreorders.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.orderId}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-800">
                        {formatCurrency(item.balanceAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            item.status === "paid"
                              ? "default"
                              : item.status === "invoiced"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/pre-order-list/${item.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 rounded-full"
                            >
                              View Detail
                            </Button>
                          </Link>
                          {item.status === "pending" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-2 rounded-full"
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: "invoice",
                                  id: item.id,
                                })
                              }
                            >
                              <Mail className="size-3.5" /> Mark Invoiced
                            </Button>
                          )}
                          {item.status === "invoiced" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-2 rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: "paid",
                                  id: item.id,
                                })
                              }
                            >
                              <CheckCircle className="size-3.5" /> Mark Paid
                            </Button>
                          )}
                          {item.status === "paid" && (
                            <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground italic">
                              <CheckCircle className="size-3 text-green-500" />{" "}
                              Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full"
            >
              <ChevronLeft className="mr-2 size-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!preorders || preorders.length < 10}
              className="rounded-full"
            >
              Next <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) =>
          !open && setConfirmModal({ isOpen: false, type: null, id: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmModal.type === "invoice"
                ? "Confirm Invoice"
                : "Confirm Payment"}
            </DialogTitle>
            <DialogDescription>
              {confirmModal.type === "invoice"
                ? "Are you sure you want to mark this settlement as invoiced? This should be done after the final invoice has been sent to the customer."
                : "Are you sure you want to mark this settlement as paid? This should be done after receiving the final payment."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() =>
                setConfirmModal({ isOpen: false, type: null, id: null })
              }
            >
              Cancel
            </Button>
            <Button
              disabled={invoiceMutation.isPending || paidMutation.isPending}
              onClick={handleAction}
            >
              {invoiceMutation.isPending || paidMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

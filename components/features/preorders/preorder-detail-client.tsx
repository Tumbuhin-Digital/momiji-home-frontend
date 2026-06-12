"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Mail, CheckCircle, Clock, ExternalLink } from "lucide-react"

import { usePreorderDetail } from "@/hooks/use-preorders"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { InvoiceSettlementModal } from "./invoice-settlement-modal"
import { PaidSettlementModal } from "./paid-settlement-modal"

export function PreorderDetailClient({
  settlementId,
}: {
  settlementId: string
}) {
  const {
    data: settlement,
    isLoading,
    isError,
    refetch,
  } = usePreorderDetail(settlementId)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: "invoice" | "paid" | null
  }>({
    isOpen: false,
    type: null,
  })

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 text-orange-700"
          >
            Pending
          </Badge>
        )
      case "invoiced":
        return (
          <Badge
            variant="secondary"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            Invoiced
          </Badge>
        )
      case "paid":
        return (
          <Badge
            variant="default"
            className="border-green-200 bg-green-50 text-green-700"
          >
            Paid
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderDate = (dateString?: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
  }

  return (
    <div className="flex w-full flex-col gap-6 px-6 pb-12 lg:pr-6 lg:pl-0">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-4 pt-6">
        <div>
          <Link href="/pre-order-list">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 -ml-3 gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Pre-Order List
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-medium text-neutral-800">
            Settlement Detail
          </h1>
          {settlement && (
            <div className="flex gap-2">
              {settlement.status === "pending" && (
                <Button
                  className="gap-2"
                  onClick={() =>
                    setConfirmModal({ isOpen: true, type: "invoice" })
                  }
                >
                  <Mail className="h-4 w-4" /> Mark as Invoiced
                </Button>
              )}
              {settlement.status === "invoiced" && (
                <Button
                  className="gap-2 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                  variant="secondary"
                  onClick={() =>
                    setConfirmModal({ isOpen: true, type: "paid" })
                  }
                >
                  <CheckCircle className="h-4 w-4" /> Mark as Paid
                </Button>
              )}
              {settlement.status === "paid" && (
                <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  <CheckCircle className="h-4 w-4" /> Completed
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center">
          <p className="mb-2 font-medium text-destructive">
            Failed to load settlement detail
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : settlement ? (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-semibold text-neutral-800">
              Settlement Information
            </h2>
            {renderStatusBadge(settlement.status)}
          </div>

          <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-neutral-500">Order ID</p>
              <Link
                href={`/order-management/${settlement.orderId}`}
                className="mt-1 flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                {settlement.orderId}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-500">
                Balance Amount
              </p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {formatCurrency(settlement.balanceAmount)}
              </p>
            </div>

            <div className="sm:col-span-2">
              <div className="grid grid-cols-2 gap-4 rounded-lg border bg-neutral-50 p-4 md:grid-cols-4">
                <div>
                  <p className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" /> Created At
                  </p>
                  <p className="text-sm font-medium">
                    {renderDate(settlement.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" /> Due Date
                  </p>
                  <p className="text-sm font-medium">
                    {renderDate(settlement.dueDate)}
                  </p>
                </div>
                {settlement.invoicedAt && (
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                      <Mail className="h-3 w-3" /> Invoiced At
                    </p>
                    <p className="text-sm font-medium text-blue-700">
                      {renderDate(settlement.invoicedAt)}
                    </p>
                  </div>
                )}
                {settlement.paidAt && (
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                      <CheckCircle className="h-3 w-3" /> Paid At
                    </p>
                    <p className="text-sm font-medium text-green-700">
                      {renderDate(settlement.paidAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border py-12 text-center text-muted-foreground">
          Settlement not found.
        </div>
      )}

      {settlement && (
        <>
          <InvoiceSettlementModal
            isOpen={confirmModal.isOpen && confirmModal.type === "invoice"}
            onClose={() => setConfirmModal({ isOpen: false, type: null })}
            settlementId={settlement.id}
            orderId={settlement.orderId}
          />
          <PaidSettlementModal
            isOpen={confirmModal.isOpen && confirmModal.type === "paid"}
            onClose={() => setConfirmModal({ isOpen: false, type: null })}
            settlementId={settlement.id}
            orderId={settlement.orderId}
          />
        </>
      )}
    </div>
  )
}

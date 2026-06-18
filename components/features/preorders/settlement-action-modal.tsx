/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { StatusBadge } from "@/components/global/status-badge"

import {
  useInvoiceSettlement,
  usePaidSettlement,
  usePreorderDetail,
} from "@/hooks/use-preorders"
import { formatCurrency } from "@/lib/utils"

interface SettlementActionModalProps {
  isOpen: boolean
  orderNumber: string
  settlementId: string
  onClose: () => void
}

export function SettlementActionModal({
  isOpen,
  orderNumber,
  settlementId,
  onClose,
}: SettlementActionModalProps) {
  const {
    data: settlement,
    isLoading,
    isError,
  } = usePreorderDetail(isOpen ? settlementId : "")

  const invoiceMutation = useInvoiceSettlement()
  const paidMutation = usePaidSettlement()

  const isMutating = invoiceMutation.isPending || paidMutation.isPending
  const mutationError = invoiceMutation.error || paidMutation.error

  const handleInvoice = async () => {
    try {
      await invoiceMutation.mutateAsync(settlementId)
      onClose()
    } catch {}
  }

  const handlePaid = async () => {
    try {
      await paidMutation.mutateAsync(settlementId)
      onClose()
    } catch {}
  }

  const statusLabelMap: Record<string, string> = {
    pending: "Pending",
    invoiced: "Invoiced",
    paid: "Paid",
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isMutating && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settlement — {orderNumber}</DialogTitle>
          <DialogDescription>
            Detail and action for this pre-order settlement.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-4 py-2">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          ) : isError || !settlement ? (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="size-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">
                Failed to load settlement details. Please try again.
              </p>
            </div>
          ) : (
            <>
              {/* Info rows */}
              <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-neutral-500">Status</span>
                  <StatusBadge
                    status={
                      statusLabelMap[settlement.status] || settlement.status
                    }
                    className="h-6! rounded-full px-3 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-neutral-500">Balance Due</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(settlement.balanceAmount)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-neutral-500">Order ID</span>
                  <span className="font-medium text-neutral-700">
                    {settlement.orderId}
                  </span>
                </div>
                {settlement.dueDate && (
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-neutral-500">Due Date</span>
                    <span className="text-neutral-700">
                      {settlement.dueDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Mutation error */}
              {mutationError && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-xs text-destructive">
                    {(mutationError as any)?.response?.status === 409
                      ? "Conflict: Settlement cannot be transitioned at this time."
                      : ((mutationError as any)?.message ??
                        "An unexpected error occurred.")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isMutating}
            className="rounded-full"
          >
            Cancel
          </Button>

          {/* Render action button based on fetched status */}
          {!isLoading && !isError && settlement?.status === "pending" && (
            <Button
              onClick={handleInvoice}
              disabled={isMutating}
              className="gap-2 rounded-full"
            >
              {invoiceMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Send Invoice
            </Button>
          )}

          {!isLoading && !isError && settlement?.status === "invoiced" && (
            <Button
              onClick={handlePaid}
              disabled={isMutating}
              variant="secondary"
              className="gap-2 rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
            >
              {paidMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle className="size-4" />
              )}
              Mark as Paid
            </Button>
          )}

          {!isLoading && !isError && settlement?.status === "paid" && (
            <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              <CheckCircle className="size-4" />
              Completed
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

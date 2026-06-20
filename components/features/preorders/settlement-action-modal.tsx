/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AlertCircle, CheckCircle, Mail, ReceiptText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

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
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ReceiptText className="size-8 text-primary" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide sm:text-[22px]">
                Settlement — {orderNumber}
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Detail and action for this pre-order settlement.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        {/* Body */}
        <div className="space-y-4 px-6">
          {isLoading ? (
            <div className="divide-y divide-neutral-100 rounded border border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-neutral-500">Status</span>
                <Skeleton className="h-6 w-20 animate-pulse rounded-full" />
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-neutral-500">Balance Due</span>
                <Skeleton className="h-5 w-24 animate-pulse rounded" />
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-neutral-500">Order ID</span>
                <Skeleton className="h-5 w-48 animate-pulse rounded" />
              </div>
            </div>
          ) : isError || !settlement ? (
            <div className="flex items-center gap-3 rounded border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="size-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">
                Failed to load settlement details. Please try again.
              </p>
            </div>
          ) : (
            <>
              {/* Info rows */}
              <div className="divide-y divide-neutral-100 rounded border border-neutral-200 bg-neutral-50">
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
                <div className="flex items-start gap-3 rounded border border-destructive/20 bg-destructive/5 p-3">
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
        <DialogFooter
          variant="bare"
          className="w-full flex-col-reverse gap-3 px-6 pb-6 sm:flex-col-reverse sm:space-x-0 sm:px-6"
        >
          <DialogClose
            render={
              <Button
                variant="outline"
                size="lg"
                className="w-full font-medium text-slate-500"
                onClick={onClose}
                disabled={isMutating}
              />
            }
          >
            {settlement?.status === "paid" ? "Close" : "Cancel"}
          </DialogClose>

          {isLoading && (
            <Skeleton className="h-10 w-full animate-pulse rounded-sm sm:h-9" />
          )}

          {!isLoading && !isError && settlement?.status === "pending" && (
            <Button
              type="button"
              size="lg"
              className="w-full font-medium"
              onClick={handleInvoice}
              disabled={isMutating}
            >
              {invoiceMutation.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 size-4" />
                  Send Invoice
                </>
              )}
            </Button>
          )}

          {!isLoading && !isError && settlement?.status === "invoiced" && (
            <Button
              type="button"
              size="lg"
              className="w-full border border-primary/20 bg-primary/10 font-medium text-primary hover:bg-primary/20"
              onClick={handlePaid}
              disabled={isMutating}
            >
              {paidMutation.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 size-4" />
                  Mark as Paid
                </>
              )}
            </Button>
          )}

          {!isLoading && !isError && settlement?.status === "paid" && (
            <div className="flex w-full items-center justify-center gap-2 rounded border border-green-200 bg-green-50 py-3 text-sm font-medium text-green-700">
              <CheckCircle className="size-4" />
              Completed
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

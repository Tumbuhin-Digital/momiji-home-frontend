/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Link from "next/link"

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
// import { Spinner } from "@/components/ui/spinner"

import { StatusBadge } from "@/components/global/status-badge"

import {
  useInvoiceSettlement,
  usePaidSettlement,
  usePreorderDetail,
} from "@/hooks/use-preorders"
import { formatCurrency } from "@/lib/utils"

interface SettlementPreOrderModalProps {
  isOpen: boolean
  orderNumber: string
  settlementId: string
  onClose: () => void
}

export function SettlementPreOrderModal({
  isOpen,
  orderNumber,
  settlementId,
  onClose,
}: SettlementPreOrderModalProps) {
  const {
    data: settlement,
    isLoading,
    isError,
  } = usePreorderDetail(settlementId, isOpen)

  const invoiceMutation = useInvoiceSettlement()
  const paidMutation = usePaidSettlement()

  const isMutating = invoiceMutation.isPending || paidMutation.isPending
  const mutationError = invoiceMutation.error || paidMutation.error

  // const handlePaid = async () => {
  //   if (!settlement) return
  //   try {
  //     await paidMutation.mutateAsync([settlement.orderLineItemId])
  //     onClose()
  //   } catch {}
  // }

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

        <div className="space-y-4 px-6">
          {isLoading ? (
            <div className="space-y-4">
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
              <Skeleton className="h-30 w-full animate-pulse rounded-lg" />
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

              {settlement.status === "pending" && (
                <div className="flex flex-col gap-2 rounded border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-700">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-800">
                        How to Request Second Payment
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-blue-600">
                        To send the pre-order remaining balance invoice (Request
                        Second Payment), you must process/accept this pre-order
                        on the Order Management page first.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/order-management?orderId=${settlement.orderId}`}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    Order Details
                  </Link>
                </div>
              )}

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

          {!isLoading && !isError && settlement?.status === "invoiced" && (
            <div className="flex w-full flex-col gap-3">
              <div className="flex w-full items-center justify-center gap-2 rounded border border-blue-200 bg-blue-50 py-3 text-sm font-medium text-blue-700">
                <Mail className="size-4" />
                Already Request Second Payment
              </div>
              {/* <Button
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
              </Button> */}
            </div>
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

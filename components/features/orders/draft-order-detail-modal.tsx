"use client"

import { useState } from "react"

import { format } from "date-fns"
import { ExternalLink, Mail, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toastManager } from "@/components/ui/toast"

import { DraftOrderEditPanel } from "@/components/features/orders/draft-order-edit-panel"

import { useSendManualOrderInvoice } from "@/hooks/use-manual-order"
import { useWebsiteDraftOrder } from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"

import type { WebsiteDraftAddressDto } from "@/types/orders"

const statusLabel: Record<string, string> = {
  OPEN: "Open",
  INVOICE_SENT: "Invoice sent",
  COMPLETED: "Completed",
}

interface DraftOrderDetailModalProps {
  draftId: string
  isOpen: boolean
  onClose: () => void
}

function personName(address?: WebsiteDraftAddressDto): string {
  return [address?.first_name, address?.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")
}

function formatAddress(address?: WebsiteDraftAddressDto): string {
  if (!address) return ""
  const cityLine = [address.city, address.province, address.zip]
    .filter(Boolean)
    .join(", ")
  return [address.address1, address.address2, cityLine, address.country]
    .filter((part) => Boolean(part && part.trim()))
    .join(", ")
}

function InfoField({
  label,
  value,
  isLoading,
  strong = false,
}: {
  label: string
  value: string
  isLoading: boolean
  strong?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-[11px] leading-none text-[#959595]">{label}</p>
      {isLoading ? (
        <Skeleton className="h-4 w-28" />
      ) : (
        <p
          className={
            strong
              ? "text-sm leading-snug font-bold text-[#2C3E50]"
              : "text-sm leading-snug text-[#4A4A4A]"
          }
        >
          {value || "-"}
        </p>
      )}
    </div>
  )
}

export function DraftOrderDetailModal({
  draftId,
  isOpen,
  onClose,
}: DraftOrderDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const { data, isLoading, isError, refetch } = useWebsiteDraftOrder(
    draftId,
    isOpen
  )
  const sendInvoice = useSendManualOrderInvoice()
  const canChange = data != null && data.status !== "COMPLETED"

  const resendInvoice = async () => {
    if (!data?.email) return
    try {
      await sendInvoice.mutateAsync({
        draftOrderId: data.id,
        email: data.email,
      })
      toastManager.add({
        title: "Invoice sent",
        description: `Shopify emailed the invoice to ${data.email}.`,
        type: "success",
      })
      refetch()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Shopify could not send the email."
      toastManager.add({
        title: "Failed to send invoice",
        description: message,
        type: "error",
      })
    }
  }

  const currency = data?.currency || "USD"
  const money = (amount?: string) =>
    `${formatCurrency(amount || "0")} ${currency}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-3 px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <div className="text-left">
            <DialogTitle className="text-2xl font-bold tracking-tight text-[#2C3E50] sm:text-[28px]">
              {data?.name || "Draft order"}
            </DialogTitle>
            <span className="text-sm text-[#7F8C8D]">
              {isLoading
                ? "Loading draft..."
                : data
                  ? `${statusLabel[data.status] || data.status} · ${money(data.total)}`
                  : "Draft order"}
            </span>
          </div>
          <Button
            type="button"
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="rounded bg-[#F1F2F6] hover:bg-[#E1E2E6]"
          >
            <XIcon className="size-5 text-[#7F8C8D]" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          {isError ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-center">
              <p className="mb-2 font-medium text-destructive">
                Could not load this draft order
              </p>
              <button
                type="button"
                className="text-sm underline"
                onClick={() => refetch()}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-[#EBEBEB] bg-[#F4F1ED] px-4 py-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-[#4A4A4A] uppercase">
                  Customer Information
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  <InfoField
                    label="Email"
                    value={data?.email || "-"}
                    isLoading={isLoading}
                  />
                  <InfoField
                    label="Status"
                    value={
                      data
                        ? statusLabel[data.status] || data.status || "-"
                        : "-"
                    }
                    isLoading={isLoading}
                  />
                  <InfoField
                    label="Created"
                    value={
                      data?.created_at
                        ? format(new Date(data.created_at), "MMMM d, yyyy")
                        : "-"
                    }
                    isLoading={isLoading}
                  />
                  <InfoField
                    label="Total"
                    value={data ? money(data.total) : "-"}
                    isLoading={isLoading}
                    strong
                  />
                  <InfoField
                    label="Shipping Recipient"
                    value={personName(data?.shipping_address) || "-"}
                    isLoading={isLoading}
                  />
                  <InfoField
                    label="Billing Name"
                    value={
                      personName(data?.billing_address) ||
                      personName(data?.shipping_address) ||
                      "-"
                    }
                    isLoading={isLoading}
                  />
                  <InfoField
                    label="Shipping Address"
                    value={formatAddress(data?.shipping_address) || "-"}
                    isLoading={isLoading}
                  />
                  <InfoField
                    label="Billing Address"
                    value={
                      formatAddress(data?.billing_address) ||
                      formatAddress(data?.shipping_address) ||
                      "-"
                    }
                    isLoading={isLoading}
                  />
                  {data?.order_name ? (
                    <InfoField
                      label="Shopify Order"
                      value={data.order_name}
                      isLoading={false}
                    />
                  ) : null}
                </div>
              </div>

              {editing && data ? (
                <DraftOrderEditPanel
                  draft={data}
                  onCancel={() => setEditing(false)}
                  onSaved={() => {
                    setEditing(false)
                    refetch()
                  }}
                />
              ) : (
              <>
              {canChange ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                </div>
              ) : null}
              <div className="overflow-hidden rounded-xl border border-[#EBEBEB]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F2EDE4]">
                    <tr>
                      <th className="px-4 py-3 font-medium text-black">ITEM</th>
                      <th className="px-4 py-3 font-medium text-black">QTY</th>
                      <th className="px-4 py-3 font-medium text-black">PRICE</th>
                      <th className="px-4 py-3 font-medium text-black">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {isLoading && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      </tr>
                    )}
                    {!isLoading && (data?.line_items.length ?? 0) === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-neutral-400"
                        >
                          No items on this draft.
                        </td>
                      </tr>
                    )}
                    {data?.line_items.map((item, index) => (
                      <tr key={`${item.sku || item.title}-${index}`}>
                        <td className="px-4 py-3 text-black">
                          <p className="font-medium">{item.title || "-"}</p>
                          {item.sku ? (
                            <p className="text-xs text-neutral-400">{item.sku}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-black">{item.quantity}</td>
                        <td className="px-4 py-3 text-black">
                          {money(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {money(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoField
                  label="Shipping"
                  value={
                    data?.shipping_title
                      ? `${data.shipping_title} · ${money(data.shipping_amount)}`
                      : data?.shipping_amount
                        ? money(data.shipping_amount)
                        : "-"
                  }
                  isLoading={isLoading}
                />
                <InfoField
                  label="Subtotal"
                  value={data ? money(data.subtotal) : "-"}
                  isLoading={isLoading}
                />
                <InfoField
                  label="Tax"
                  value={data ? money(data.total_tax) : "-"}
                  isLoading={isLoading}
                />
                <InfoField
                  label="Total"
                  value={data ? money(data.total) : "-"}
                  isLoading={isLoading}
                  strong
                />
              </div>
              </>
              )}

              {!editing && data?.note ? (
                <InfoField label="Note" value={data.note} isLoading={false} />
              ) : null}

              {!editing && canChange ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        loading={sendInvoice.isPending}
                        disabled={!data?.email}
                        onClick={resendInvoice}
                      >
                        <Mail className="size-4" />
                        Resend invoice
                      </Button>
                      {data?.invoice_url ? (
                        <Button
                          variant="outline"
                          render={
                            <a
                              href={data.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <ExternalLink className="size-4" />
                          Open invoice
                        </Button>
                      ) : null}
                    </div>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

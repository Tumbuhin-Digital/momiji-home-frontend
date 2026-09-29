"use client"

import { useState } from "react"

import { format } from "date-fns"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"

import { DraftOrderDetailModal } from "@/components/features/orders/draft-order-detail-modal"

import { formatCurrency } from "@/lib/utils"

import type { WebsiteDraftOrderDto } from "@/types/orders"

const statusLabel: Record<string, string> = {
  OPEN: "Open",
  INVOICE_SENT: "Invoice sent",
  COMPLETED: "Completed",
}

interface DraftOrdersTableProps {
  drafts: WebsiteDraftOrderDto[]
  isLoading: boolean
}

export function DraftOrdersTable({ drafts, isLoading }: DraftOrdersTableProps) {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)

  return (
    <div className="overflow-hidden rounded-t-md bg-[#F9F9F9]">
      <div className="h-[calc(100vh-150px)] overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-225 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#F2EDE4]">
            <tr>
              <th className="px-6 py-4 font-medium text-black">DRAFT</th>
              <th className="px-6 py-4 font-medium text-black">EMAIL</th>
              <th className="px-6 py-4 font-medium text-black">CREATED</th>
              <th className="px-6 py-4 font-medium text-black">STATUS</th>
              <th className="px-6 py-4 font-medium text-black">TOTAL</th>
              <th className="px-6 py-4 font-medium text-black">INVOICE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-neutral-400">
                  Loading draft orders...
                </td>
              </tr>
            )}
            {!isLoading && drafts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-neutral-400">
                  No draft orders from this website.
                </td>
              </tr>
            )}
            {!isLoading &&
              drafts.map((draft) => (
                <tr key={draft.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 align-middle font-medium text-black">
                    {draft.name || draft.id}
                  </td>
                  <td className="px-6 py-4 align-middle text-black">
                    {draft.email || "-"}
                  </td>
                  <td className="px-6 py-4 align-middle text-black">
                    {draft.created_at
                      ? format(new Date(draft.created_at), "MM/dd/yyyy")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 align-middle text-black">
                    {statusLabel[draft.status] || draft.status || "-"}
                  </td>
                  <td className="px-6 py-4 align-middle text-black">
                    {formatCurrency(draft.total || "0")} {draft.currency || "USD"}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDraftId(draft.id)}
                      >
                        View
                      </Button>
                      {draft.invoice_url && draft.status !== "COMPLETED" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          render={
                            <a
                              href={draft.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <ExternalLink className="size-4" />
                          Open
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {selectedDraftId ? (
        <DraftOrderDetailModal
          draftId={selectedDraftId}
          isOpen
          onClose={() => setSelectedDraftId(null)}
        />
      ) : null}
    </div>
  )
}

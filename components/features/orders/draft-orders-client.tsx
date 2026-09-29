"use client"

import { DraftOrdersTable } from "@/components/features/orders/draft-orders-table"

import { useWebsiteDraftOrders } from "@/hooks/use-orders"

export function DraftOrdersClient() {
  const { data, isLoading, isError, refetch } = useWebsiteDraftOrders()
  const drafts = data ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[32px] font-medium text-neutral-800">
          Draft Orders
        </h1>
        <p className="text-lg text-neutral-400">
          Draft orders from this website · {drafts.length} drafts
        </p>
      </div>

      {isError ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <p className="mb-2 font-medium text-destructive">
            Could not load draft orders
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
        <DraftOrdersTable drafts={drafts} isLoading={isLoading} />
      )}
    </div>
  )
}

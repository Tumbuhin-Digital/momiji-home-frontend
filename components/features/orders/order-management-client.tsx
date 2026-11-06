"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { toastManager } from "@/components/ui/toast"

import { OrderManagementTable } from "@/components/features/orders/order-management-table"
import { OrderSyncResultModal } from "@/components/features/orders/order-sync-result-modal"

import { Iconsax3dRotate } from "@/public/icons/iconsax-3d-rotate"

import { useInfiniteOrders, useSyncOrdersFromShopify } from "@/hooks/use-orders"
import { formatLastSynced } from "@/lib/utils"

import type { OrderSyncResultDto } from "@/types/orders"

export function OrderManagementClient() {
  const syncMutation = useSyncOrdersFromShopify()
  const [syncResult, setSyncResult] = useState<OrderSyncResultDto | null>(
    null
  )
  const isSyncing = syncMutation.isPending

  const handleSync = async () => {
    try {
      setSyncResult(await syncMutation.mutateAsync())
    } catch {
      toastManager.add({
        title: "Sync failed",
        description: "Could not read orders from Shopify. Nothing was changed.",
        type: "error",
      })
    }
  }

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteOrders(
    {},
    { staleTime: 0, refetchOnMount: "always" }
  )

  const orders = data?.pages.flatMap((page) => page.orders) || []
  const totalOrders = data?.pages[0]?.total || 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-medium text-neutral-800">
            Order Management
          </h1>
          <p className="text-lg text-neutral-400">
            {formatLastSynced(new Date())} · {totalOrders} orders in total
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="h-10! w-full gap-1.5 rounded-full border-none bg-primary/20 px-4 py-2 text-primary hover:bg-primary/30 hover:text-primary sm:w-fit"
        >
          <Iconsax3dRotate
            className={`size-6 ${isSyncing ? "animate-spin" : ""}`}
          />
          <span className="text-sm">
            {isSyncing ? "Syncing Shopify Orders" : "Sync Shopify Orders"}
          </span>
        </Button>
      </div>

      <OrderSyncResultModal
        result={syncResult}
        onClose={() => setSyncResult(null)}
      />

      {isError ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <p className="mb-2 font-medium text-destructive">
            Failed to load orders
          </p>
          <p className="mb-4 text-sm text-destructive/80">
            Please check your connection or try again later.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <OrderManagementTable
          orders={orders}
          isLoading={isLoading}
          isRefetching={isFetching && !isLoading}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </div>
  )
}

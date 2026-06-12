"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { OrderManagementTable } from "@/components/features/orders/order-management-table"
import { Iconsax3dRotate } from "@/public/icons/iconsax-3d-rotate"

import { useOrders } from "@/hooks/use-orders"
import { useForceSync } from "@/hooks/use-sync"

export function OrderManagementClient() {
  const { data: orders, isLoading, isFetching, isError, refetch } = useOrders()
  const forceSyncMutation = useForceSync()

  const isSyncing = isFetching || forceSyncMutation.isPending

  const handleSync = async () => {
    try {
      await forceSyncMutation.mutateAsync()
      toast.success("Products synced successfully")
    } catch {}
  }

  return (
    <div className="flex w-full flex-col gap-6 px-6 lg:pr-6 lg:pl-0">
      <div className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-medium text-neutral-800">
            Order Management
          </h1>
          <p className="text-lg text-neutral-400">
            Last synced:{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="h-10 gap-1.5 bg-primary/20 px-4 py-2 text-primary hover:bg-primary/30 hover:text-primary"
        >
          <Iconsax3dRotate
            className={`size-6 ${isSyncing ? "animate-spin" : ""}`}
          />
          <span className="text-sm font-medium">Syncing Shopify Product</span>
        </Button>
      </div>

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
        <OrderManagementTable orders={orders || []} isLoading={isLoading} />
      )}
    </div>
  )
}

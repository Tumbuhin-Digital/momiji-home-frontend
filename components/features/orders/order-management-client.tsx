"use client"

import { Button } from "@/components/ui/button"

import { OrderManagementTable } from "@/components/features/orders/order-management-table"

import { useOrders } from "@/hooks/use-orders"
import { formatLastSynced } from "@/lib/utils"

export function OrderManagementClient() {
  const { data: orders, isLoading, isError, refetch } = useOrders()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-medium text-neutral-800">
            Order Management
          </h1>
          <p className="text-lg text-neutral-400">
            {formatLastSynced(new Date())}
          </p>
        </div>
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

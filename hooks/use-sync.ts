"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { syncService } from "@/lib/services"

export function useForceSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: syncService.forceSyncAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.all })
    },
  })
}

export function useProductSyncPolling(intervalMs = 30000) {
  const queryClient = useQueryClient()

  useQuery({
    queryKey: ["products-sync-polling"],
    queryFn: async () => {
      const response = await fetch("/api/v1/products/sync", {
        method: "POST",
        credentials: "include",
      })
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      }
      return response.ok
    },
    refetchInterval: intervalMs,
    refetchIntervalInBackground: true,
  })
}

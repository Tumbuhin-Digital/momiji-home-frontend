"use client"

import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

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

/**
 * Hourly product sync. Intentionally does NOT sync on mount —
 * mounting SyncProvider on every admin page load was blocking the UI
 * for the full Shopify sync (~10–15s).
 */
export function useProductSyncPolling(intervalMs = 60 * 60 * 1000) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const runSync = async () => {
      try {
        const response = await fetch("/api/v1/products/sync", {
          method: "POST",
          credentials: "include",
        })
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
        }
      } catch {
        // ignore transient network errors; next interval will retry
      }
    }

    const id = window.setInterval(runSync, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, queryClient])
}

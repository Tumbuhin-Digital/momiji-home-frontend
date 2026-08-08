"use client"

import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { syncService } from "@/lib/services"

const LAST_PRODUCTS_SYNC_KEY = "momiji_last_products_sync_at"
export const PRODUCTS_SYNC_STALE_MS = 20 * 60 * 1000 // 20 minutes

export function getLastProductsSyncAt(): number | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(LAST_PRODUCTS_SYNC_KEY)
  if (!raw) return null
  const ts = Number(raw)
  return Number.isFinite(ts) ? ts : null
}

export function markProductsSynced(at = Date.now()): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(LAST_PRODUCTS_SYNC_KEY, String(at))
}

export function isProductsSyncStale(
  staleAfterMs = PRODUCTS_SYNC_STALE_MS
): boolean {
  const last = getLastProductsSyncAt()
  if (last == null) return true
  return Date.now() - last >= staleAfterMs
}

export function useForceSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: syncService.forceSyncAll,
    onSuccess: () => {
      markProductsSynced()
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
    },
  })
}

async function runProductsSync(
  queryClient: ReturnType<typeof useQueryClient>
): Promise<boolean> {
  await syncService.forceSyncAll()
  markProductsSynced()
  queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
  return true
}

/**
 * Sync when entering a page if the last successful sync is older than staleAfterMs.
 * Skips if a sync ran within the window (manual or auto).
 */
export function useProductSyncOnVisit(staleAfterMs = PRODUCTS_SYNC_STALE_MS) {
  const queryClient = useQueryClient()
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true
    if (!isProductsSyncStale(staleAfterMs)) return

    void runProductsSync(queryClient).catch(() => {
      // ignore; user can still sync manually
    })
  }, [queryClient, staleAfterMs])
}

/**
 * Background interval sync. Only runs when the last sync is stale.
 */
export function useProductSyncPolling(intervalMs = PRODUCTS_SYNC_STALE_MS) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const tick = () => {
      if (!isProductsSyncStale(intervalMs)) return
      void runProductsSync(queryClient).catch(() => {
        // ignore transient network errors; next interval will retry
      })
    }

    const id = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, queryClient])
}

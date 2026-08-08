"use client"

import { useProductSyncPolling, PRODUCTS_SYNC_STALE_MS } from "@/hooks"

export function SyncProvider() {
  useProductSyncPolling(PRODUCTS_SYNC_STALE_MS) // 20 minutes
  return null
}

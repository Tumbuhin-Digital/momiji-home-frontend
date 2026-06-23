"use client"

import { useProductSyncPolling } from "@/hooks"

export function SyncProvider() {
  useProductSyncPolling(60 * 60 * 1000) // 1 hour
  return null
}

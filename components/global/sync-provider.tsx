"use client"

import { useProductSyncPolling } from "@/hooks"

export function SyncProvider() {
  useProductSyncPolling(30000)
  return null
}

import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"

async function forceSyncAll(): Promise<void> {
  // Full Shopify catalog sync often exceeds the default 15s API timeout.
  await apiClient.post<BaseResponse<void>>("/products/sync", undefined, {
    timeout: 120_000,
  })
}

export const syncService = {
  forceSyncAll,
}

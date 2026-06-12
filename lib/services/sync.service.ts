import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"

async function forceSyncAll(): Promise<void> {
  await apiClient.post<BaseResponse<void>>("/products/sync")
}

export const syncService = {
  forceSyncAll,
}

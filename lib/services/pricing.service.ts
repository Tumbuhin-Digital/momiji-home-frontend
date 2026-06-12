import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type { UpdatePricingInput } from "@/types/products"

async function updatePricing(
  id: string,
  input: UpdatePricingInput
): Promise<void> {
  await apiClient.patch<BaseResponse<void>>(`/products/variant/price`, {
    variant_id: id,
    ws_price: input.basePrice,
  })
}

export const pricingService = {
  updatePricing,
}

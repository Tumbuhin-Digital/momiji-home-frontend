import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  ShippingCalculateInput,
  ShippingMethodsResult,
  ShippingMethodsResultDto,
  ValidateAddressRequest,
} from "@/types/shipping"

function mapShippingMethodsToDomain(
  dto: ShippingMethodsResultDto
): ShippingMethodsResult {
  return {
    currency: dto.currency,
    methods: dto.methods.map((m) => ({
      id: m.id,
      label: m.label,
      cost: m.cost,
      estimatedArrival: m.estimated_arrival,
    })),
  }
}

async function getMethods(): Promise<ShippingMethodsResult> {
  const response =
    await apiClient.get<BaseResponse<ShippingMethodsResultDto>>(
      "/shipping/methods"
    )

  if (!response.data) {
    throw new Error("Failed to load shipping methods")
  }

  return mapShippingMethodsToDomain(response.data)
}

async function calculateShipping(input: ShippingCalculateInput): Promise<void> {
  await apiClient.post<BaseResponse<void>>("/shipping/calculate", input)
}

async function validateAddress(data: ValidateAddressRequest): Promise<void> {
  await apiClient.post<BaseResponse<void>>("/shipping/validate-address", data)
}

export const shippingService = {
  getMethods,
  calculateShipping,
  validateAddress,
}

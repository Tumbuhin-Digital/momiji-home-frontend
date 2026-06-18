import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  ShippingRate,
  ShippingRateDto,
  ValidateAddressRequest,
} from "@/types/shipping"

function mapShippingRateDtoToDomain(dto: ShippingRateDto): ShippingRate {
  return {
    cost: dto.cost,
    currency: dto.currency,
    deliveryDays: dto.delivery_days,
    label: dto.label,
    serviceCode: dto.service_code,
  }
}

async function getShippingRates(
  zip: string,
  country?: string
): Promise<ShippingRate[]> {
  const response = await apiClient.post<BaseResponse<ShippingRateDto[]>>(
    "/shipping/rates",
    { zip, country }
  )

  if (!response.data) {
    throw new Error("Failed to load shipping rates")
  }

  return response.data.map(mapShippingRateDtoToDomain)
}

async function validateAddress(data: ValidateAddressRequest): Promise<void> {
  await apiClient.post<BaseResponse<void>>("/shipping/validate-address", data)
}

export const shippingService = {
  getShippingRates,
  validateAddress,
}

import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  ShippingRate,
  ShippingRateDto,
  ShippingRatesRequest,
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
  input: ShippingRatesRequest
): Promise<ShippingRate[]> {
  const response = await apiClient.post<BaseResponse<ShippingRateDto[]>>(
    "/shipping/rates",
    {
      zip: input.zip,
      country: input.country,
      city: input.city,
      state: input.state,
      address1: input.address1,
    }
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

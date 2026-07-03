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

function dedupeShippingRates(rates: ShippingRate[]): ShippingRate[] {
  const cheapestByServiceCode = new Map<string, ShippingRate>()

  for (const rate of rates) {
    const existing = cheapestByServiceCode.get(rate.serviceCode)
    if (!existing || parseFloat(rate.cost) < parseFloat(existing.cost)) {
      cheapestByServiceCode.set(rate.serviceCode, rate)
    }
  }

  return [...cheapestByServiceCode.values()].sort(
    (a, b) => parseFloat(a.cost) - parseFloat(b.cost)
  )
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
      segment: input.segment,
      origin: input.origin,
    }
  )

  if (!response.data) {
    throw new Error("Failed to load shipping rates")
  }

  return dedupeShippingRates(response.data.map(mapShippingRateDtoToDomain))
}

async function validateAddress(data: ValidateAddressRequest): Promise<void> {
  await apiClient.post<BaseResponse<void>>("/shipping/validate-address", data)
}

export const shippingService = {
  getShippingRates,
  validateAddress,
}

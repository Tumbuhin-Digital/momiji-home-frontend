import { useMutation, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { shippingService } from "@/lib/services/shipping.service"

import type { ShippingRatesRequest, ValidateAddressRequest } from "@/types/shipping"

export function useShippingRates(
  input: ShippingRatesRequest,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.shipping.methods(), input],
    queryFn: () => shippingService.getShippingRates(input),
    ...options,
  })
}

export function useValidateAddress() {
  return useMutation({
    mutationFn: (input: ValidateAddressRequest) =>
      shippingService.validateAddress(input),
  })
}

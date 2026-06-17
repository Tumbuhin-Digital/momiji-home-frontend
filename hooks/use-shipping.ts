import { useMutation, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { shippingService } from "@/lib/services/shipping.service"

import type { ValidateAddressRequest } from "@/types/shipping"

export function useShippingRates(
  zip: string,
  country?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.shipping.methods(), { zip, country }],
    queryFn: () => shippingService.getShippingRates(zip, country),
    ...options,
  })
}

export function useValidateAddress() {
  return useMutation({
    mutationFn: (input: ValidateAddressRequest) =>
      shippingService.validateAddress(input),
  })
}

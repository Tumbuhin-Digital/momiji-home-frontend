import { useMutation, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { shippingService } from "@/lib/services/shipping.service"

import type {
  ShippingCalculateInput,
  ValidateAddressRequest,
} from "@/types/shipping"

export function useCalculateShipping() {
  return useMutation({
    mutationFn: (input: ShippingCalculateInput) =>
      shippingService.calculateShipping(input),
  })
}

export function useShippingMethods(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shipping.methods(),
    queryFn: () => shippingService.getMethods(),
    ...options,
  })
}

export function useValidateAddress() {
  return useMutation({
    mutationFn: (input: ValidateAddressRequest) =>
      shippingService.validateAddress(input),
  })
}

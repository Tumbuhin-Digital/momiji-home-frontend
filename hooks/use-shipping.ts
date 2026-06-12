import { useQuery, useMutation } from "@tanstack/react-query"
import { shippingService } from "@/lib/services/shipping.service"
import { queryKeys } from "@/lib/query/query-keys"

export function useShippingMethods(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shipping.methods(),
    queryFn: () => shippingService.getMethods(),
    ...options,
  })
}

export function useCalculateShipping() {
  return useMutation({
    mutationFn: (input: import("@/types/shipping").ShippingCalculateInput) =>
      shippingService.calculateShipping(input),
  })
}

export function useValidateAddress() {
  return useMutation({
    mutationFn: (input: import("@/types/shipping").ValidateAddressRequest) =>
      shippingService.validateAddress(input),
  })
}

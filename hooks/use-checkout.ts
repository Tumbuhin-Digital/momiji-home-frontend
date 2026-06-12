import { useQuery, useMutation } from "@tanstack/react-query"
import { checkoutService } from "@/lib/services/checkout.service"
import { queryKeys } from "@/lib/query/query-keys"
import type {
  CheckoutSummaryInput,
  CheckoutCreateInput,
} from "@/types/checkout"

export function useCheckoutSummary(input: CheckoutSummaryInput) {
  return useQuery({
    queryKey: queryKeys.checkout.summary(input),
    queryFn: () => checkoutService.getSummary(input),
    enabled: true,
  })
}

export function useCheckoutConfirm(checkoutReference: string | undefined) {
  return useQuery({
    queryKey: queryKeys.checkout.confirm(checkoutReference as string),
    queryFn: () =>
      checkoutService.getCheckoutConfirm(checkoutReference as string),
    enabled: !!checkoutReference,
  })
}

export function useCheckoutSummaryMutation() {
  return useMutation({
    mutationFn: (input: CheckoutSummaryInput) =>
      checkoutService.getSummary(input),
  })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (input: CheckoutCreateInput) =>
      checkoutService.createCheckout(input),
  })
}

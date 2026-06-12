import { useMutation, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { checkoutService } from "@/lib/services/checkout.service"

import type {
  CheckoutCreateInput,
  CheckoutSummaryInput,
} from "@/types/checkout"

export function useCheckoutConfirm(checkoutReference: string | undefined) {
  return useQuery({
    queryKey: queryKeys.checkout.confirm(checkoutReference as string),
    queryFn: () =>
      checkoutService.getCheckoutConfirm(checkoutReference as string),
    enabled: !!checkoutReference,
  })
}

export function useCheckoutSummary(input: CheckoutSummaryInput) {
  return useQuery({
    queryKey: queryKeys.checkout.summary(input),
    queryFn: () => checkoutService.getSummary(input),
    enabled: true,
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

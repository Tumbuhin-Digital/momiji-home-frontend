"use client"

import { useMemo } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { queryKeys } from "@/lib/query/query-keys"
import { shippingService } from "@/lib/services/shipping.service"

import type {
  ShippingRatesRequest,
  ValidateAddressRequest,
} from "@/types/shipping"

const RATES_DEBOUNCE_MS = 400

export function useShippingRates(
  input: ShippingRatesRequest,
  options?: { enabled?: boolean }
) {
  const inputKey = JSON.stringify(input)
  const debouncedKey = useDebouncedValue(inputKey, RATES_DEBOUNCE_MS)
  const debouncedInput = useMemo(
    () => JSON.parse(debouncedKey) as ShippingRatesRequest,
    [debouncedKey]
  )
  const requested = options?.enabled ?? true
  const pending = inputKey !== debouncedKey

  const query = useQuery({
    queryKey: [...queryKeys.shipping.methods(), debouncedInput],
    queryFn: () => shippingService.getShippingRates(debouncedInput),
    enabled: requested && !pending,
    retry: false,
    meta: { suppressErrorToast: true },
  })

  return {
    ...query,
    isPending: query.isPending || (requested && pending),
    isLoading: query.isLoading || (requested && pending),
    isFetching: query.isFetching || (requested && pending),
    isError: query.isError && !pending,
  }
}

export function useValidateAddress() {
  return useMutation({
    mutationFn: (input: ValidateAddressRequest) =>
      shippingService.validateAddress(input),
  })
}

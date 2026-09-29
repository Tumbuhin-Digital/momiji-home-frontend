import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { manualOrderService } from "@/lib/services/manual-order.service"

import type { ManualOrderCreateRequest } from "@/types/manual-order"

export function useCreateManualOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ManualOrderCreateRequest) =>
      manualOrderService.createManualOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.drafts() })
    },
  })
}

export function useSendManualOrderInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { draftOrderId: string; email: string }) =>
      manualOrderService.sendManualOrderInvoice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.drafts() })
    },
  })
}

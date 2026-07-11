import { useMutation } from "@tanstack/react-query"

import { manualOrderService } from "@/lib/services/manual-order.service"

import type { ManualOrderCreateRequest } from "@/types/manual-order"

export function useCreateManualOrder() {
  return useMutation({
    mutationFn: (input: ManualOrderCreateRequest) =>
      manualOrderService.createManualOrder(input),
  })
}

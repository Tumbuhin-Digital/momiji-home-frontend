import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { preorderService } from "@/lib/services/preorder.service"

import type { PreorderQueryParams } from "@/types/preorders"

export function useExportPreorders() {
  return useMutation({
    mutationFn: (params: { batch_label?: string; status?: string } = {}) =>
      preorderService.exportPreorders(params),
  })
}

export function useInvoiceSettlement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderLineItemIds: string[]) =>
      preorderService.invoiceSettlement(orderLineItemIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preorders.all })
      data.forEach((item) => {
        queryClient.setQueryData(queryKeys.preorders.detail(item.id), item)
      })
    },
  })
}

export function usePaidSettlement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderLineItemIds: string[]) =>
      preorderService.paidSettlement(orderLineItemIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preorders.all })
      data.forEach((item) => {
        queryClient.setQueryData(queryKeys.preorders.detail(item.id), item)
      })
    },
  })
}

export function usePreorderDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.preorders.detail(id),
    queryFn: () => preorderService.getSettlementById(id),
    enabled: enabled && !!id,
  })
}

export function usePreorders(params: PreorderQueryParams) {
  return useQuery({
    queryKey: queryKeys.preorders.list(params),
    queryFn: () => preorderService.getSettlements(params),
  })
}

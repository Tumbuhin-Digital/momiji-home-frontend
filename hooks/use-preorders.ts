import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { preorderService } from "@/lib/services/preorder.service"
import { queryKeys } from "@/lib/query/query-keys"
import type { PreorderQueryParams } from "@/types/preorders"

export function usePreorders(params: PreorderQueryParams) {
  return useQuery({
    queryKey: queryKeys.preorders.list(params),
    queryFn: () => preorderService.getSettlements(params),
  })
}

export function usePreorderDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.preorders.detail(id),
    queryFn: () => preorderService.getSettlementById(id),
    enabled: !!id,
  })
}

export function useInvoiceSettlement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => preorderService.invoiceSettlement(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preorders.all })
      queryClient.setQueryData(queryKeys.preorders.detail(data.id), data)
    },
  })
}

export function usePaidSettlement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => preorderService.paidSettlement(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preorders.all })
      queryClient.setQueryData(queryKeys.preorders.detail(data.id), data)
    },
  })
}

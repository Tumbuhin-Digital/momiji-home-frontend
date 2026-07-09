"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { preorderCustomTextService } from "@/lib/services/preorder-custom-text.service"

export function usePreorderCustomTexts(search?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.preorderCustomTexts.list(search),
    queryFn: () => preorderCustomTextService.listPreorderCustomTexts(search),
    enabled,
    meta: { suppressErrorToast: true },
  })
}

export function useCreatePreorderCustomText() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (label: string) =>
      preorderCustomTextService.createPreorderCustomText(label),
    meta: { suppressErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.preorderCustomTexts.all,
      })
    },
  })
}

export function useDeletePreorderCustomText() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      preorderCustomTextService.deletePreorderCustomText(id),
    meta: { suppressErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.preorderCustomTexts.all,
      })
    },
  })
}

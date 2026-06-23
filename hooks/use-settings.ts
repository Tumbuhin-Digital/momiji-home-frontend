"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { settingsService } from "@/lib/services/settings.service"

import type { UpdateCheckoutNotesInput } from "@/types/settings"

export function useCheckoutNotes() {
  return useQuery({
    queryKey: queryKeys.settings.checkoutNotes(),
    queryFn: () => settingsService.getCheckoutNotes(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.admin(),
    queryFn: () => settingsService.getSettings(),
  })
}

export function useUpdateCheckoutNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCheckoutNotesInput) =>
      settingsService.updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all })
    },
  })
}

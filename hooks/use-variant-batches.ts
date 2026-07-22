"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query/query-keys"
import { batchesService } from "@/lib/services/batches.service"

import type {
  Batch,
  CreateBatchInput,
  ReorderBatchInput,
  UpdateBatchInput,
  VariantBatchesResponse,
} from "@/types/batches"

function isOpenBatch(status: Batch["status"]) {
  return status === "active" || status === "queued"
}

function applyOptimisticReorder(
  batches: Batch[],
  batchId: string,
  sequence: number
): Batch[] {
  const fromIdx = batches.findIndex((batch) => batch.id === batchId)
  if (fromIdx < 0) return batches

  const moving = batches[fromIdx]
  if (!isOpenBatch(moving.status)) return batches

  const toIdx = Math.max(0, Math.min(sequence - 1, batches.length - 1))
  if (fromIdx === toIdx) {
    return syncOpenStatuses(
      batches.map((batch, index) => ({ ...batch, sequence: index + 1 }))
    )
  }

  const without = [
    ...batches.slice(0, fromIdx),
    ...batches.slice(fromIdx + 1),
  ]
  const reordered = [
    ...without.slice(0, toIdx),
    moving,
    ...without.slice(toIdx),
  ]

  return syncOpenStatuses(
    reordered.map((batch, index) => ({ ...batch, sequence: index + 1 }))
  )
}

function syncOpenStatuses(batches: Batch[]): Batch[] {
  let firstOpen = true
  return batches.map((batch) => {
    if (!isOpenBatch(batch.status)) return batch
    if (firstOpen) {
      firstOpen = false
      return { ...batch, status: "active" }
    }
    return { ...batch, status: "queued" }
  })
}

export function useVariantBatches(variantId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.batches.byVariant(variantId),
    queryFn: () => batchesService.getVariantBatches(variantId),
    enabled: enabled && !!variantId,
  })
}

export function useCreateBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      variantId,
      input,
    }: {
      input: CreateBatchInput
      variantId: string
    }) => batchesService.createBatch(variantId, input),
    onSuccess: async (_, { variantId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.batches.byVariant(variantId),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useUpdateBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      input,
      variantId,
    }: {
      batchId: string
      input: UpdateBatchInput
      variantId: string
    }) => batchesService.updateBatch(batchId, input),
    onMutate: async ({ batchId, input, variantId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.batches.byVariant(variantId),
      })

      const previous = queryClient.getQueryData<{
        batches: Batch[]
        summary: {
          activeBatchId?: string | null
          hasUnlimitedFallback: boolean
          totalBatches: number
        }
      }>(queryKeys.batches.byVariant(variantId))

      if (previous) {
        queryClient.setQueryData(queryKeys.batches.byVariant(variantId), {
          ...previous,
          batches: previous.batches.map((batch) =>
            batch.id === batchId
              ? {
                  ...batch,
                  ...(input.name ? { name: input.name } : null),
                  ...(typeof input.qty_allocated === "number"
                    ? {
                        qtyAllocated: input.qty_allocated,
                        qtyRemaining: Math.max(
                          0,
                          input.qty_allocated - batch.qtySold
                        ),
                      }
                    : null),
                }
              : batch
          ),
        })
      }

      return { previous, variantId }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.batches.byVariant(context.variantId),
          context.previous
        )
      }
    },
    onSettled: async (_data, _error, { variantId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.batches.byVariant(variantId),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useCloseBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ batchId }: { batchId: string; variantId: string }) =>
      batchesService.closeBatch(batchId),
    onSuccess: async (data, { variantId }) => {
      queryClient.setQueryData(queryKeys.batches.byVariant(variantId), data)
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useCancelBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ batchId }: { batchId: string; variantId: string }) =>
      batchesService.cancelBatch(batchId),
    onSuccess: async (_, { variantId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.batches.byVariant(variantId),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useReorderBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      input,
    }: {
      batchId: string
      input: ReorderBatchInput
      variantId: string
    }) => batchesService.reorderBatch(batchId, input),
    onMutate: async ({ batchId, input, variantId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.batches.byVariant(variantId),
      })

      const previous = queryClient.getQueryData<VariantBatchesResponse>(
        queryKeys.batches.byVariant(variantId)
      )

      if (previous) {
        const batches = applyOptimisticReorder(
          [...previous.batches].sort((a, b) => a.sequence - b.sequence),
          batchId,
          input.sequence
        )
        const active = batches.find((batch) => batch.status === "active")
        queryClient.setQueryData(queryKeys.batches.byVariant(variantId), {
          ...previous,
          batches,
          summary: {
            ...previous.summary,
            activeBatchId: active?.id ?? null,
          },
        })
      }

      return { previous, variantId }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.batches.byVariant(context.variantId),
          context.previous
        )
      }
    },
    onSettled: async (_data, _error, { variantId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.batches.byVariant(variantId),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

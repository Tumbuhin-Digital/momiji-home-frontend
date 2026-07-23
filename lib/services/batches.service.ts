import { apiClient } from "@/lib/api"

import type { BaseResponse } from "@/types/core"
import type {
  Batch,
  BatchDto,
  CreateBatchInput,
  ReorderBatchInput,
  UpdateBatchInput,
  VariantBatchesResponse,
  VariantBatchesResponseDto,
} from "@/types/batches"

/**
 * Path-safe variant id for /variants/:id/batches.
 * Shopify GIDs contain "/" — encodeURIComponent turns those into %2F, which
 * Vercel rejects with an empty 400 before the request reaches the API.
 * Bare numeric ids avoid that and are expanded to GIDs on the backend.
 */
function toVariantPathParam(variantId: string): string {
  const trimmed = variantId.trim()
  const numeric = trimmed.includes("/")
    ? (trimmed.split("/").pop() ?? trimmed)
    : trimmed
  if (/^\d+$/.test(numeric)) {
    return numeric
  }
  return encodeURIComponent(trimmed)
}

function mapBatch(dto: BatchDto): Batch {
  return {
    closedAt: dto.closed_at,
    createdAt: dto.created_at,
    id: dto.id,
    name: dto.name,
    qtyAllocated: dto.qty_allocated,
    qtyRemaining: dto.qty_remaining,
    qtySold: dto.qty_sold,
    sequence: dto.sequence,
    status: dto.status,
  }
}

function mapResponse(dto: VariantBatchesResponseDto): VariantBatchesResponse {
  return {
    batches: dto.batches.map(mapBatch),
    summary: {
      activeBatchId: dto.summary.active_batch_id,
      hasUnlimitedFallback: dto.summary.has_unlimited_fallback,
      totalBatches: dto.summary.total_batches,
    },
  }
}

async function getVariantBatches(
  variantId: string
): Promise<VariantBatchesResponse> {
  const response = await apiClient.get<BaseResponse<VariantBatchesResponseDto>>(
    `/variants/${toVariantPathParam(variantId)}/batches`
  )
  if (!response.data) {
    throw new Error("Failed to load variant batches")
  }
  return mapResponse(response.data)
}

async function createBatch(
  variantId: string,
  input: CreateBatchInput
): Promise<Batch> {
  const response = await apiClient.post<BaseResponse<BatchDto>>(
    `/variants/${toVariantPathParam(variantId)}/batches`,
    input
  )
  if (!response.data) {
    throw new Error("Failed to create batch")
  }
  return mapBatch(response.data)
}

async function updateBatch(
  batchId: string,
  input: UpdateBatchInput
): Promise<Batch> {
  const response = await apiClient.patch<BaseResponse<BatchDto>>(
    `/batches/${batchId}`,
    input
  )
  if (!response.data) {
    throw new Error("Failed to update batch")
  }
  return mapBatch(response.data)
}

async function closeBatch(batchId: string): Promise<VariantBatchesResponse> {
  const response = await apiClient.post<
    BaseResponse<VariantBatchesResponseDto>
  >(`/batches/${batchId}/close`)
  if (!response.data) {
    throw new Error("Failed to close batch")
  }
  return mapResponse(response.data)
}

async function cancelBatch(batchId: string): Promise<Batch> {
  const response = await apiClient.post<BaseResponse<BatchDto>>(
    `/batches/${batchId}/cancel`
  )
  if (!response.data) {
    throw new Error("Failed to cancel batch")
  }
  return mapBatch(response.data)
}

async function reorderBatch(
  batchId: string,
  input: ReorderBatchInput
): Promise<Batch> {
  const response = await apiClient.post<BaseResponse<BatchDto>>(
    `/batches/${batchId}/reorder`,
    input
  )
  if (!response.data) {
    throw new Error("Failed to reorder batch")
  }
  return mapBatch(response.data)
}

export const batchesService = {
  cancelBatch,
  closeBatch,
  createBatch,
  getVariantBatches,
  reorderBatch,
  updateBatch,
}

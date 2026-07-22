import type { BatchStatus } from "./entities"

export interface BatchDto {
  closed_at?: string | null
  created_at: string
  id: string
  name: string
  qty_allocated: number
  qty_remaining: number
  qty_sold: number
  sequence: number
  status: BatchStatus
}

export interface BatchSummaryDto {
  active_batch_id?: string | null
  has_unlimited_fallback: boolean
  total_batches: number
}

export interface VariantBatchesResponseDto {
  batches: BatchDto[]
  summary: BatchSummaryDto
}

export interface CreateBatchInput {
  name: string
  qty_allocated: number
}

export interface UpdateBatchInput {
  name?: string
  qty_allocated?: number
}

export interface ReorderBatchInput {
  sequence: number
}

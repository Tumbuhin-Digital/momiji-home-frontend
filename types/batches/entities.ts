export type BatchStatus = "active" | "queued" | "closed" | "cancelled"

export interface Batch {
  closedAt?: string | null
  createdAt: string
  id: string
  name: string
  qtyAllocated: number
  qtyRemaining: number
  qtySold: number
  sequence: number
  status: BatchStatus
}

export interface BatchSummary {
  activeBatchId?: string | null
  hasUnlimitedFallback: boolean
  totalBatches: number
}

export interface VariantBatchesResponse {
  batches: Batch[]
  summary: BatchSummary
}

export interface BatchDepletion {
  closedBatchName: string
  imageUrl: string
  nextBatchName?: string | null
  productTitle: string
  variantId: string
}

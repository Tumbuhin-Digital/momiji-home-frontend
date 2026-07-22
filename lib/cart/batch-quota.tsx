import type { ReactNode } from "react"

import type { BatchDepletion } from "@/types/batches"
import type { Product } from "@/types/products"

export function getActiveBatchRemaining(product: Product): number | null {
  if (product.batchSummary?.activeBatchRemaining != null) {
    return product.batchSummary.activeBatchRemaining
  }
  if (product.inventory.batchQuota != null) {
    return product.inventory.batchQuota
  }
  return null
}

export function shouldShowBatchDepletion(
  product: Product,
  newPreOrderQty: number,
  acceptedDepletion: boolean
): boolean {
  if (acceptedDepletion) return false
  if (product.category !== "pre-order") return false
  if (!product.batchSummary?.hasBatches) return false

  const remaining = getActiveBatchRemaining(product)
  if (remaining == null) return false
  return newPreOrderQty > remaining
}

/** Acceptance only applies while qty stays above the active batch; reset once back within quota. */
export function shouldClearBatchDepletionAcceptance(
  product: Product,
  quantity: number
): boolean {
  if (product.category !== "pre-order") return false
  if (!product.batchSummary?.hasBatches) return false

  const remaining = getActiveBatchRemaining(product)
  if (remaining == null) return quantity <= 0
  return quantity <= remaining
}

export function buildBatchDepletionEvent(product: Product): BatchDepletion {
  return {
    closedBatchName:
      product.batchSummary?.activeBatchName ||
      product.preorderCustomText ||
      "Current batch",
    imageUrl: product.imageUrl || product.images?.[0]?.src || "",
    nextBatchName: product.batchSummary?.nextBatchName ?? null,
    productTitle: product.title,
    variantId: product.sku,
  }
}

export const BATCH_DEPLETED_TITLE = "Current pre-order batch has depleted"

export function buildBatchDepletionDescription(
  depletion: BatchDepletion
): ReactNode {
  if (depletion.nextBatchName) {
    return (
      <>
        Pre-order (<strong>{depletion.closedBatchName}</strong>) has sold out.
        Quantities will now be added on next batch (
        <strong>{depletion.nextBatchName}</strong>).
      </>
    )
  }

  return (
    <>
      Pre-order (<strong>{depletion.closedBatchName}</strong>) has sold out.
      Quantities will now fall back to standard pre-order (no quota).
    </>
  )
}

import type { ReactNode } from "react"

import type { BatchDepletion, BatchDepletionKind } from "@/types/batches"
import type { BatchDepletionAcceptance } from "@/types/cart"
import type { Product } from "@/types/products"

export type BatchDepletionStage = "none" | "next_batch" | "unlimited"

export type BatchDepletionAcceptanceSync =
  | { action: "none" }
  | { action: "clear" }
  | { action: "downgrade"; level: "next_batch" }

export function getActiveBatchRemaining(product: Product): number | null {
  if (product.batchSummary?.activeBatchRemaining != null) {
    return product.batchSummary.activeBatchRemaining
  }
  if (product.inventory.batchQuota != null) {
    return product.inventory.batchQuota
  }
  return null
}

export function getMaxBatchOrderableQty(product: Product): number | null {
  if (product.batchSummary?.maxBatchOrderableQty != null) {
    return product.batchSummary.maxBatchOrderableQty
  }
  if (product.inventory.batchAvailable != null) {
    return product.inventory.batchAvailable
  }
  return null
}

function hasNextBatchQuota(product: Product): boolean {
  if (product.batchSummary?.nextBatchName) return true
  const remaining = getActiveBatchRemaining(product)
  const max = getMaxBatchOrderableQty(product)
  return remaining != null && max != null && max > remaining
}

/**
 * Which warning modal (if any) should show for the proposed qty.
 * Priority: next_batch first, then unlimited (after next_batch was accepted).
 */
export function getBatchDepletionStage(
  product: Product,
  newPreOrderQty: number,
  acceptance: BatchDepletionAcceptance | undefined
): BatchDepletionStage {
  if (product.category !== "pre-order") return "none"
  if (!product.batchSummary?.hasBatches) return "none"

  const remaining = getActiveBatchRemaining(product)
  const max = getMaxBatchOrderableQty(product)

  if (remaining != null && newPreOrderQty > remaining && !acceptance) {
    return "next_batch"
  }

  if (
    hasNextBatchQuota(product) &&
    max != null &&
    newPreOrderQty > max &&
    acceptance !== "unlimited"
  ) {
    return "unlimited"
  }

  return "none"
}

export function shouldShowBatchDepletion(
  product: Product,
  newPreOrderQty: number,
  acceptedDepletion: boolean
): boolean {
  // Legacy boolean API: treat any acceptance as blocking all stages
  const acceptance: BatchDepletionAcceptance | undefined = acceptedDepletion
    ? "unlimited"
    : undefined
  return getBatchDepletionStage(product, newPreOrderQty, acceptance) !== "none"
}

/** How to sync persisted acceptance when qty moves relative to batch quotas. */
export function getBatchDepletionAcceptanceSync(
  product: Product,
  quantity: number,
  current: BatchDepletionAcceptance | undefined
): BatchDepletionAcceptanceSync {
  if (!current) return { action: "none" }
  if (product.category !== "pre-order") {
    return quantity <= 0 ? { action: "clear" } : { action: "none" }
  }
  if (!product.batchSummary?.hasBatches) {
    return quantity <= 0 ? { action: "clear" } : { action: "none" }
  }

  const remaining = getActiveBatchRemaining(product)
  const max = getMaxBatchOrderableQty(product)

  if (remaining == null) {
    return quantity <= 0 ? { action: "clear" } : { action: "none" }
  }
  if (quantity <= remaining) return { action: "clear" }
  if (current === "unlimited" && max != null && quantity <= max) {
    return { action: "downgrade", level: "next_batch" }
  }
  return { action: "none" }
}

/** @deprecated Prefer getBatchDepletionAcceptanceSync — clears only when back within active batch. */
export function shouldClearBatchDepletionAcceptance(
  product: Product,
  quantity: number
): boolean {
  return (
    getBatchDepletionAcceptanceSync(product, quantity, "next_batch").action ===
    "clear"
  )
}

export function buildBatchDepletionEvent(
  product: Product,
  kind: BatchDepletionKind = "next_batch"
): BatchDepletion {
  const imageUrl = product.imageUrl || product.images?.[0]?.src || ""
  const productTitle = product.title
  const variantId = product.sku

  if (kind === "unlimited") {
    return {
      kind: "unlimited",
      closedBatchName:
        product.batchSummary?.nextBatchName ||
        product.batchSummary?.activeBatchName ||
        product.preorderCustomText ||
        "All batches",
      imageUrl,
      nextBatchName: null,
      productTitle,
      variantId,
    }
  }

  return {
    kind: "next_batch",
    closedBatchName:
      product.batchSummary?.activeBatchName ||
      product.preorderCustomText ||
      "Current batch",
    imageUrl,
    nextBatchName: product.batchSummary?.nextBatchName ?? null,
    productTitle,
    variantId,
  }
}

export const BATCH_DEPLETED_TITLE = "Current pre-order batch has depleted"
export const ALL_BATCHES_DEPLETED_TITLE =
  "All pre-order batches have depleted"

export function getBatchDepletionTitle(depletion: BatchDepletion): string {
  return depletion.kind === "unlimited"
    ? ALL_BATCHES_DEPLETED_TITLE
    : BATCH_DEPLETED_TITLE
}

export function buildBatchDepletionDescription(
  depletion: BatchDepletion
): ReactNode {
  if (depletion.kind === "unlimited") {
    return (
      <>
        All quota batches for this product have sold out. Additional quantities
        will fall back to standard pre-order (shipping date to be determined).
      </>
    )
  }

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

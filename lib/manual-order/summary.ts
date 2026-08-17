import { splitShippingHalf } from "@/lib/checkout/shipping-split"

import type { ManualLine } from "@/types/manual-order"

export interface ManualOrderSegments {
  shipReady: ManualLine[]
  preOrder: ManualLine[]
}

/** Split selected lines by fulfillment type + inventory overflow (mirrors cart). */
export function splitManualLines(lines: ManualLine[]): ManualOrderSegments {
  const shipReady: ManualLine[] = []
  const preOrder: ManualLine[] = []

  for (const line of lines) {
    if (line.fulfillmentType === "pre_order") {
      preOrder.push({ ...line })
      continue
    }

    if (line.quantity <= line.inventoryQuantity) {
      shipReady.push({ ...line })
      continue
    }

    if (line.inventoryQuantity > 0) {
      shipReady.push({ ...line, quantity: line.inventoryQuantity })
    }
    const overflow = line.quantity - line.inventoryQuantity
    if (overflow > 0) {
      preOrder.push({
        ...line,
        fulfillmentType: "pre_order",
        quantity: overflow,
      })
    }
  }

  return { shipReady, preOrder }
}

export interface ManualOrderSummaryInput {
  shipReady: ManualLine[]
  preOrder: ManualLine[]
  shippingCost: number
  shippingPreorder: number
  shipTogether?: boolean
}

export interface ManualOrderSummary {
  shipReadyTotal: number
  preorderDeposit: number
  preorderBalance: number
  shippingCost: number
  shippingPreorder: number
  /** Half of shippingPreorder, charged upfront. */
  shippingPreorderDeposit: number
  /** The other half, billed with the settlement invoice. */
  shippingPreorderBalance: number
  totalDueNow: number
  totalDueLater: number
}

export function computeManualOrderSummary(
  input: ManualOrderSummaryInput
): ManualOrderSummary {
  const shipReadyFull = input.shipReady.reduce(
    (sum, line) => sum + line.wsPrice * line.quantity,
    0
  )
  const preorderFull = input.preOrder.reduce(
    (sum, line) => sum + line.wsPrice * line.quantity,
    0
  )

  const treatAllAsPreOrder =
    Boolean(input.shipTogether) &&
    input.shipReady.length > 0 &&
    input.preOrder.length > 0

  const shipReadyTotal = treatAllAsPreOrder ? 0 : shipReadyFull
  const preorderDeposit = treatAllAsPreOrder
    ? (preorderFull + shipReadyFull) * 0.5
    : preorderFull * 0.5
  const preorderBalance = treatAllAsPreOrder
    ? (preorderFull + shipReadyFull) * 0.5
    : preorderFull * 0.5
  const shippingCost = treatAllAsPreOrder ? 0 : input.shippingCost
  const shippingPreorder = input.shippingPreorder
  const shippingHalves = splitShippingHalf(shippingPreorder)

  return {
    shipReadyTotal,
    preorderDeposit,
    preorderBalance,
    shippingCost,
    shippingPreorder,
    shippingPreorderDeposit: shippingHalves.upfront,
    shippingPreorderBalance: shippingHalves.remaining,
    totalDueNow:
      shipReadyTotal + shippingCost + preorderDeposit + shippingHalves.upfront,
    totalDueLater: preorderBalance + shippingHalves.remaining,
  }
}

export function formatProductDims(line: {
  weightKg?: number
  widthCm?: number
  heightCm?: number
  depthCm?: number
}): string {
  const parts: string[] = []
  if (line.weightKg != null && line.weightKg > 0) {
    parts.push(`${line.weightKg} kg`)
  }
  const w = line.widthCm
  const h = line.heightCm
  const d = line.depthCm
  if (w && h && d) {
    parts.push(`${w} × ${h} × ${d} cm (W×H×D)`)
  }
  return parts.join(" · ")
}

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
}

export interface ManualOrderSummary {
  shipReadyTotal: number
  preorderDeposit: number
  preorderBalance: number
  shippingCost: number
  shippingPreorder: number
  totalDueNow: number
  totalDueLater: number
}

export function computeManualOrderSummary(
  input: ManualOrderSummaryInput
): ManualOrderSummary {
  const shipReadyTotal = input.shipReady.reduce(
    (sum, line) => sum + line.wsPrice * line.quantity,
    0
  )
  const preorderFull = input.preOrder.reduce(
    (sum, line) => sum + line.wsPrice * line.quantity,
    0
  )
  const preorderDeposit = preorderFull * 0.5
  const preorderBalance = preorderFull * 0.5

  return {
    shipReadyTotal,
    preorderDeposit,
    preorderBalance,
    shippingCost: input.shippingCost,
    shippingPreorder: input.shippingPreorder,
    totalDueNow: shipReadyTotal + input.shippingCost + preorderDeposit,
    totalDueLater: preorderBalance + input.shippingPreorder,
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

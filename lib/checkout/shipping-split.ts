/**
 * Splits a pre-order shipping total into the half charged at checkout and the half
 * billed with the settlement invoice. The remainder is derived by subtraction rather
 * than rounded independently, so the two halves always sum to the total exactly.
 * Mirrors shipping.SplitHalf on the backend — keep both in sync.
 */
export function splitShippingHalf(total: number): {
  upfront: number
  remaining: number
} {
  const rounded = Math.round((Number.isFinite(total) ? total : 0) * 100) / 100
  if (rounded <= 0) return { upfront: 0, remaining: 0 }

  const upfront = Math.round(rounded * 50) / 100
  return {
    upfront,
    remaining: Math.round((rounded - upfront) * 100) / 100,
  }
}

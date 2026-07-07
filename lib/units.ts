const KG_TO_LB = 2.20462
const CM_PER_IN = 2.54

export function kgToLb(kg: number): number {
  return kg * KG_TO_LB
}

export function cmToIn(cm: number): number {
  return Math.round((cm / CM_PER_IN) * 100) / 100
}

type VariantSpecsInput = {
  weightKg?: number
  widthCm?: number
  heightCm?: number
  depthCm?: number
}

export function formatVariantSpecs(product: VariantSpecsInput): string | null {
  const { weightKg = 0, widthCm = 0, heightCm = 0, depthCm = 0 } = product

  const hasWeight = weightKg > 0
  const hasDimensions = widthCm > 0 || heightCm > 0 || depthCm > 0

  if (!hasWeight && !hasDimensions) {
    return null
  }

  const parts: string[] = []

  if (hasWeight) {
    parts.push(`${kgToLb(weightKg).toFixed(2)} lb`)
  }

  if (hasDimensions) {
    parts.push(
      `${cmToIn(depthCm).toFixed(2)} × ${cmToIn(widthCm).toFixed(2)} × ${cmToIn(heightCm).toFixed(2)} in (L×W×H)`
    )
  }

  return parts.join(" · ")
}

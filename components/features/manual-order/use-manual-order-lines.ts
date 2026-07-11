"use client"

import { useCallback, useMemo, useState } from "react"

import {
  splitManualLines,
  type ManualOrderSegments,
} from "@/lib/manual-order/summary"

import type { ManualLine } from "@/types/manual-order"
import type { Product } from "@/types/products"

function productToManualLine(product: Product, quantity = 1): ManualLine | null {
  if (product.category === "inactive") return null

  return {
    variantId: product.sku,
    title: product.title,
    imageSrc: product.imageUrl,
    wsPrice: product.pricing.basePrice,
    retailPrice: product.retailPrice ?? 0,
    quantity,
    fulfillmentType:
      product.category === "pre-order" ? "pre_order" : "ship_ready",
    inventoryQuantity: product.inventory.quantity,
    weightKg: product.weightKg,
    widthCm: product.widthCm,
    heightCm: product.heightCm,
    depthCm: product.depthCm,
    batchLabel: product.preorderCustomText,
  }
}

export function useManualOrderLines(initial: ManualLine[] = []) {
  const [lines, setLines] = useState<ManualLine[]>(initial)

  const segments: ManualOrderSegments = useMemo(
    () => splitManualLines(lines),
    [lines]
  )

  const addProducts = useCallback((products: Product[]) => {
    setLines((prev) => {
      const next = [...prev]
      for (const product of products) {
        const mapped = productToManualLine(product, 1)
        if (!mapped) continue
        const existing = next.findIndex((l) => l.variantId === mapped.variantId)
        if (existing >= 0) {
          next[existing] = {
            ...next[existing],
            quantity: next[existing].quantity + 1,
          }
        } else {
          next.push(mapped)
        }
      }
      return next
    })
  }, [])

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity < 1) {
        return prev.filter((l) => l.variantId !== variantId)
      }
      return prev.map((l) =>
        l.variantId === variantId ? { ...l, quantity } : l
      )
    })
  }, [])

  const removeLine = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  return {
    lines,
    shipReady: segments.shipReady,
    preOrder: segments.preOrder,
    addProducts,
    setQuantity,
    removeLine,
    clear,
  }
}

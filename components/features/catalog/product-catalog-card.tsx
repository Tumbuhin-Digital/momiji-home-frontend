/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toastManager } from "@/components/ui/toast"

import { Boxes } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { InventoryDepletedModal } from "@/components/features/catalog/inventory-depleted-modal"
import { QuantitySelector } from "@/components/global/quantity-selector"

import {
  useCart,
  useCreateCartSession,
  useUpdateVariantQuantity,
} from "@/hooks"
import { useCartStore } from "@/lib/stores/cart.store"
import { formatCurrency } from "@/lib/utils"

import type { ProductCatalogCardProps } from "@/types/products"

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const {
    market,
    sessionId,
    expiresAt,
    setSessionId,
    isGlobalPending,
    setIsGlobalPending,
  } = useCartStore()

  const [localQuantity, setLocalQuantity] = useState(0)
  const [showDepletedModal, setShowDepletedModal] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const { data: cartData } = useCart()
  const updateVariantQuantity = useUpdateVariantQuantity()
  const createSession = useCreateCartSession()

  const isShipReady = product.category === "ship-ready"

  const shipReadyCartItem = cartData?.ship_ready.find(
    (item: { variant_id: string }) => item.variant_id === product.sku
  )
  const preOrderCartItem = cartData?.pre_order.find(
    (item: { variant_id: string }) => item.variant_id === product.sku
  )

  const shipReadyQty = shipReadyCartItem?.quantity || 0
  const preOrderQty = preOrderCartItem?.quantity || 0
  const quantity = shipReadyQty + preOrderQty

  const isBackendPreOrder = preOrderCartItem !== undefined

  const marketPricing = product.pricing.markets[market]
  const price = marketPricing?.price ?? product.pricing.basePrice
  const rpp = product.retailPrice ?? 0

  const isConvertedToPreorder =
    isShipReady &&
    (product.inventory.quantity === 0 ||
      localQuantity > product.inventory.quantity)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQuantity(quantity)
  }, [quantity])

  const isPending = updateVariantQuantity.isPending || createSession.isPending

  const ensureSession = async (): Promise<boolean> => {
    const isExpired = expiresAt && new Date(expiresAt).getTime() < Date.now()
    if (sessionId && !isExpired) return true

    try {
      const session = await createSession.mutateAsync()
      const sId = (session as any).sessionId || session.session_id
      const eAt = (session as any).expiresAt || session.expires_at
      if (sId) {
        setSessionId(sId, eAt)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const triggerUpdate = (newTotal: number, immediate = false) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setLocalQuantity(newTotal)

    const doUpdate = async () => {
      if (newTotal === quantity) {
        return
      }

      setIsGlobalPending(true)

      try {
        await updateVariantQuantity.mutateAsync({
          variantId: product.sku,
          totalQuantity: newTotal,
        })
      } catch (error) {
        setLocalQuantity(quantity)
        toastManager.add({
          title: "Error",
          description: "Gagal memperbarui keranjang. Silakan coba lagi.",
          type: "error",
        })
        console.error("Cart update failed:", error)
      } finally {
        setIsGlobalPending(false)
      }
    }

    if (immediate) {
      return doUpdate()
    } else {
      debounceTimer.current = setTimeout(doUpdate, 1500)
    }
  }

  const handleIncrease = async () => {
    const hasSession = await ensureSession()
    if (!hasSession) return

    if (isShipReady && !isBackendPreOrder && !isConvertedToPreorder) {
      if (localQuantity + 1 > product.inventory.quantity) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        setLocalQuantity(localQuantity + 1)
        setShowDepletedModal(true)
        return
      }
    }
    triggerUpdate(localQuantity + 1)
  }

  const handleDecrease = async () => {
    const hasSession = await ensureSession()
    if (!hasSession) return

    triggerUpdate(localQuantity - 1)
  }

  const handleCustomChange = async (newTotal: number) => {
    const hasSession = await ensureSession()
    if (!hasSession) return

    if (isShipReady && !isBackendPreOrder && !isConvertedToPreorder) {
      if (newTotal > product.inventory.quantity) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        setLocalQuantity(newTotal)
        setShowDepletedModal(true)
        return
      }
    }
    triggerUpdate(newTotal)
  }

  return (
    <>
      <Card className="group flex h-auto min-h-23.75 w-full cursor-pointer flex-row items-stretch overflow-hidden rounded-lg border-none bg-card transition-all duration-300">
        {/* Image */}
        <div className="relative h-23.75 w-27 shrink-0 overflow-hidden rounded-lg bg-linear-to-b from-white via-white to-black/5">
          {(!isShipReady || isBackendPreOrder || isConvertedToPreorder) && (
            <Badge
              size="sm"
              className="absolute top-1 left-1 z-10 rounded-full text-xs uppercase"
            >
              Pre-Order
            </Badge>
          )}
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="relative block aspect-square h-auto max-w-full align-middle transition-opacity duration-200"
              sizes="108px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <Boxes className="size-8 text-neutral-400" strokeWidth={0.5} />
              <span className="text-sm font-light text-neutral-400">
                No Image
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="mb-2 flex-1 sm:mb-0 sm:pr-4">
            {isShipReady && (isBackendPreOrder || isConvertedToPreorder) && (
              <span className="block text-xs font-medium text-destructive sm:text-sm">
                Pre-Order
              </span>
            )}
            <h3 className="text-left text-xs text-alternate capitalize sm:text-base">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
            <div className="flex flex-col text-left sm:text-right">
              <span className="text-xs font-semibold text-alternate sm:text-lg">
                WS$ {formatCurrency(price)}
              </span>
              <span className="text-xs text-alternate/60 sm:text-base">
                RPP ${formatCurrency(rpp)}
              </span>
            </div>

            <div className="flex items-center justify-end">
              <QuantitySelector
                quantity={localQuantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onChange={handleCustomChange}
                disabled={isPending}
                isPending={isPending}
                className="h-9 w-27 sm:w-32.5"
              />
            </div>
          </div>
        </div>
      </Card>

      <InventoryDepletedModal
        isOpen={showDepletedModal}
        product={product}
        onClose={() => {
          setShowDepletedModal(false)
          setLocalQuantity(Math.max(1, quantity))
        }}
        onConfirm={async () => {
          await triggerUpdate(localQuantity, true)
          setShowDepletedModal(false)
        }}
        isPending={isGlobalPending}
      />
    </>
  )
}

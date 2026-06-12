/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { Boxes } from "lucide-react"

import { InventoryDepletedModal } from "@/components/features/catalog/inventory-depleted-modal"
import { QuantitySelector } from "@/components/global/quantity-selector"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  useAddCartItem,
  useCart,
  useCreateCartSession,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks"
import { useCartStore } from "@/lib/stores/cart.store"
import { formatCurrency } from "@/lib/utils"
import { IconBag } from "@/public/icons/icon-bag"

import type { ProductCatalogCardProps } from "@/types/products"

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const { market, sessionId, expiresAt, setSessionId } = useCartStore()
  const { data: cartData } = useCart()
  const addCartItem = useAddCartItem()
  const updateCartItem = useUpdateCartItem()
  const removeCartItem = useRemoveCartItem()
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

  const [localQuantity, setLocalQuantity] = useState(quantity)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const [showDepletedModal, setShowDepletedModal] = useState(false)

  const isConvertedToPreorder =
    isShipReady &&
    (product.inventory.quantity === 0 ||
      localQuantity > product.inventory.quantity)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQuantity(quantity)
  }, [quantity])

  const isPending =
    addCartItem.isPending ||
    updateCartItem.isPending ||
    removeCartItem.isPending ||
    createSession.isPending

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

  const triggerUpdate = (newTotal: number) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setLocalQuantity(newTotal)

    debounceTimer.current = setTimeout(() => {
      if (newTotal === quantity) return

      const maxShipReady = product.inventory.quantity
      let targetShipReadyQty = newTotal
      let targetPreOrderQty = 0

      if (isShipReady && maxShipReady > 0) {
        targetShipReadyQty = Math.min(newTotal, maxShipReady)
        targetPreOrderQty = Math.max(0, newTotal - maxShipReady)
      } else if (!isShipReady || maxShipReady === 0) {
        // If entirely pre-order from the start
        targetShipReadyQty = 0
        targetPreOrderQty = newTotal
      }

      // Handle Ship-Ready item updates
      if (targetShipReadyQty <= 0 && shipReadyCartItem) {
        removeCartItem.mutate(shipReadyCartItem.id)
      } else if (targetShipReadyQty > 0 && shipReadyCartItem) {
        if (shipReadyCartItem.quantity !== targetShipReadyQty) {
          updateCartItem.mutate({
            id: shipReadyCartItem.id,
            quantity: targetShipReadyQty,
          })
        }
      } else if (targetShipReadyQty > 0 && !shipReadyCartItem) {
        addCartItem.mutate({
          variant_id: product.sku,
          quantity: targetShipReadyQty,
        })
      }

      // Handle Pre-Order item updates
      if (targetPreOrderQty <= 0 && preOrderCartItem) {
        removeCartItem.mutate(preOrderCartItem.id)
      } else if (targetPreOrderQty > 0 && preOrderCartItem) {
        if (preOrderCartItem.quantity !== targetPreOrderQty) {
          updateCartItem.mutate({
            id: preOrderCartItem.id,
            quantity: targetPreOrderQty,
          })
        }
      } else if (targetPreOrderQty > 0 && !preOrderCartItem) {
        addCartItem.mutate({
          variant_id: product.sku,
          quantity: targetPreOrderQty,
        })
      }
    }, 600)
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
      <Card className="group flex h-full flex-col overflow-hidden rounded-[12px] border-none bg-[#F6F0EE] transition-all duration-300">
        <CardContent className="flex flex-1 flex-col p-3 sm:p-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
            {(!isShipReady || isBackendPreOrder || isConvertedToPreorder) && (
              <Badge className="absolute top-2.5 right-2.5 z-10 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white uppercase shadow-sm hover:bg-destructive sm:top-3 sm:right-3 sm:text-xs">
                Pre-Order
              </Badge>
            )}

            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 200px, 400px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Boxes className="size-8 text-slate-300" />
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-1 flex-col sm:mt-4">
            {(isBackendPreOrder || isConvertedToPreorder) && (
              <p className="mb-1 text-xs font-semibold tracking-wider text-destructive uppercase">
                Pre-Order
              </p>
            )}

            <h3 className="mb-2 line-clamp-2 flex-1 text-sm text-alternate sm:text-base">
              {product.title}
            </h3>

            <div className="mt-auto flex items-end justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-alternate sm:text-base">
                  {formatCurrency(price)}
                </p>
                <p className="text-xs text-alternate/60">
                  RPP {formatCurrency(rpp)}
                </p>
              </div>
              <div className="ml-2 shrink-0">
                {localQuantity > 0 ? (
                  <QuantitySelector
                    quantity={localQuantity}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onChange={handleCustomChange}
                    className="h-8 w-24 sm:h-10 sm:w-28"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleIncrease()
                    }}
                    disabled={isPending}
                    aria-label="Add to cart"
                    className="flex size-7.5 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 sm:size-13"
                  >
                    <IconBag className="pointer-events-none size-4.5 text-alternate sm:size-8" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryDepletedModal
        isOpen={showDepletedModal}
        product={product}
        onClose={() => {
          setShowDepletedModal(false)
          setLocalQuantity(Math.max(1, quantity))
        }}
        onConfirm={() => {
          setShowDepletedModal(false)
          triggerUpdate(localQuantity)
        }}
      />
    </>
  )
}

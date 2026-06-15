/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toastManager } from "@/components/ui/toast"

import { Boxes } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { InventoryDepletedModal } from "@/components/features/catalog/inventory-depleted-modal"
import { QuantitySelector } from "@/components/global/quantity-selector"
import { IconBag } from "@/public/icons/icon-bag"

import {
  useAddCartItem,
  useCart,
  useCreateCartSession,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks"
import { useCartStore } from "@/lib/stores/cart.store"
import { formatCurrency } from "@/lib/utils"

import type { ProductCatalogCardProps } from "@/types/products"

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const { market, sessionId, expiresAt, setSessionId, setIsGlobalPending } =
    useCartStore()

  const [localQuantity, setLocalQuantity] = useState(0)
  const [showDepletedModal, setShowDepletedModal] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

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

  const triggerUpdate = (newTotal: number, immediate = false) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setLocalQuantity(newTotal)

    const doUpdate = async () => {
      if (newTotal === quantity) {
        return
      }

      setIsGlobalPending(true)

      try {
        const maxShipReady = product.inventory.quantity
        let targetShipReadyQty = newTotal
        let targetPreOrderQty = 0

        if (isShipReady && maxShipReady > 0) {
          targetShipReadyQty = Math.min(newTotal, maxShipReady)
          targetPreOrderQty = Math.max(0, newTotal - maxShipReady)
        } else if (!isShipReady || maxShipReady === 0) {
          targetShipReadyQty = 0
          targetPreOrderQty = newTotal
        }

        if (targetShipReadyQty <= 0 && shipReadyCartItem) {
          await removeCartItem.mutateAsync(shipReadyCartItem.id)
        } else if (targetShipReadyQty > 0 && shipReadyCartItem) {
          if (shipReadyCartItem.quantity !== targetShipReadyQty) {
            await updateCartItem.mutateAsync({
              id: shipReadyCartItem.id,
              quantity: targetShipReadyQty,
            })
          }
        } else if (targetShipReadyQty > 0 && !shipReadyCartItem) {
          await addCartItem.mutateAsync({
            variant_id: product.sku,
            quantity: targetShipReadyQty,
          })
        }

        if (targetPreOrderQty <= 0 && preOrderCartItem) {
          await removeCartItem.mutateAsync(preOrderCartItem.id)
        } else if (targetPreOrderQty > 0 && preOrderCartItem) {
          if (preOrderCartItem.quantity !== targetPreOrderQty) {
            await updateCartItem.mutateAsync({
              id: preOrderCartItem.id,
              quantity: targetPreOrderQty,
            })
          }
        } else if (targetPreOrderQty > 0 && !preOrderCartItem) {
          await addCartItem.mutateAsync({
            variant_id: product.sku,
            quantity: targetPreOrderQty,
          })
        }
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
      doUpdate()
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
      <Card className="group h-full cursor-pointer overflow-hidden rounded-[14px] border-none transition-all duration-300">
        <CardContent className="relative grid gap-5 p-3 sm:p-5">
          <div className="relative aspect-square w-full overflow-hidden rounded-[14px] bg-white">
            {(!isShipReady || isBackendPreOrder || isConvertedToPreorder) && (
              <Badge
                size="lg"
                className="absolute top-2.5 left-2.5 z-10 text-sm tracking-wider uppercase shadow-sm sm:top-3 sm:left-3"
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
                sizes="(max-width: 640px) 200px, 400px"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                <Boxes
                  className="size-8 text-neutral-400 sm:size-12"
                  strokeWidth={0.5}
                />
                <span className="font-light text-neutral-400 sm:text-lg">
                  No Image
                </span>
              </div>
            )}
          </div>

          <div className="mr-6 flex flex-col justify-center-safe gap-1">
            <h3 className="max-h-10 overflow-hidden text-left text-sm capitalize sm:max-h-14 sm:text-lg">
              {product.title}
            </h3>
            <div className="flex w-full flex-col flex-wrap justify-start gap-0 self-baseline sm:flex-row sm:gap-2">
              <p className="text-sm font-medium text-alternate sm:text-base">
                {formatCurrency(price)} USD
              </p>
              <p className="text-sm text-alternate/60 sm:text-base">
                RPP {formatCurrency(rpp)} USD
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            {localQuantity > 0 ? (
              <QuantitySelector
                quantity={localQuantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onChange={handleCustomChange}
                disabled={isPending}
                isPending={isPending}
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
                className="flex size-7.5 cursor-pointer items-center justify-center rounded-full bg-white transition-all hover:bg-card hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50 sm:size-13"
              >
                <IconBag className="pointer-events-none size-4.5 text-alternate sm:size-8" />
              </button>
            )}
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
          triggerUpdate(localQuantity, true)
        }}
      />
    </>
  )
}

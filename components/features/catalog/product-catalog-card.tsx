"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { Boxes } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

import { InventoryDepletedModal } from "@/components/features/catalog/inventory-depleted-modal"
import { QuantitySelector } from "@/components/global/quantity-selector"

const DynamicImageCarousel = dynamic(
  () => import("@/components/global/image-carousel"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
)

import { useCart, useLocalCartVariantUpdate } from "@/hooks"
import { ensureCartSession } from "@/lib/cart/ensure-cart-session"
import { useCartStore } from "@/lib/stores/cart.store"
import { formatCurrency } from "@/lib/utils"

import type { ProductCatalogCardProps } from "@/types/products"

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const { market } = useCartStore()

  const [localQuantity, setLocalQuantity] = useState(0)
  const [showDepletedModal, setShowDepletedModal] = useState(false)
  const [isCardHovered, setIsCardHovered] = useState(false)

  const { data: cartData } = useCart()
  const updateLocalCart = useLocalCartVariantUpdate()

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

  const variantMeta = {
    title: product.title,
    image_src: product.imageUrl || product.images?.[0]?.src || "",
    unit_price: price.toFixed(2),
    inventory_quantity: product.inventory.quantity,
    isForcedPreOrder: !isShipReady,
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQuantity(quantity)
  }, [quantity])

  const isPending = false

  const applyLocalUpdate = (newTotal: number) => {
    setLocalQuantity(newTotal)
    updateLocalCart({
      variantId: product.sku,
      totalQuantity: newTotal,
      meta: variantMeta,
    })
    void ensureCartSession()
  }

  const handleIncrease = () => {
    if (isShipReady && !isBackendPreOrder && !isConvertedToPreorder) {
      if (localQuantity + 1 > product.inventory.quantity) {
        setLocalQuantity(localQuantity + 1)
        setShowDepletedModal(true)
        return
      }
    }
    applyLocalUpdate(localQuantity + 1)
  }

  const handleDecrease = () => {
    applyLocalUpdate(localQuantity - 1)
  }

  const handleCustomChange = (newTotal: number) => {
    if (isShipReady && !isBackendPreOrder && !isConvertedToPreorder) {
      if (newTotal > product.inventory.quantity) {
        setLocalQuantity(newTotal)
        setShowDepletedModal(true)
        return
      }
    }
    applyLocalUpdate(newTotal)
  }

  const handlePreorderConfirm = () => {
    updateLocalCart({
      variantId: product.sku,
      totalQuantity: localQuantity,
      meta: variantMeta,
    })
    void ensureCartSession()
    setShowDepletedModal(false)
  }

  return (
    <>
      <div
        className="group flex h-auto min-h-23.75 w-full cursor-pointer flex-row items-stretch gap-3 overflow-hidden rounded border-none bg-card p-3 transition-all duration-300"
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        <div className="relative h-23.75 w-27 shrink-0 overflow-hidden rounded bg-linear-to-b from-white via-white to-black/5">
          {product.images && product.images.length > 1 ? (
            <DynamicImageCarousel
              images={product.images}
              altText={product.title}
              sizes="108px"
              playOnHover
              isHovered={isCardHovered}
              autoplayDelay={1000}
            />
          ) : product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="relative block aspect-square h-auto max-w-full object-cover align-middle transition-opacity duration-200"
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
        <div className="flex flex-1 flex-col justify-center gap-1.5 sm:gap-2">
          {(!isShipReady || isBackendPreOrder || isConvertedToPreorder) && (
            <Badge className="h-5.5! w-fit rounded p-1 text-xs font-normal! uppercase">
              Pre-Order
            </Badge>
          )}
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h3 className="min-w-0 text-left text-sm leading-snug text-alternate capitalize sm:flex-1">
              {product.title}
            </h3>
            <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:items-start sm:gap-3">
              <div className="flex flex-col text-left sm:text-right">
                <span className="text-xs font-semibold text-alternate sm:text-sm">
                  WS {formatCurrency(price)}
                </span>
                <span className="text-xs text-alternate/60 sm:text-sm">
                  RPP {formatCurrency(rpp)}
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
                  className="h-9 w-27 border-none sm:w-32.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <InventoryDepletedModal
        isOpen={showDepletedModal}
        product={product}
        onClose={() => {
          setShowDepletedModal(false)
          setLocalQuantity(quantity)
        }}
        onConfirm={handlePreorderConfirm}
        isPending={false}
      />
    </>
  )
}

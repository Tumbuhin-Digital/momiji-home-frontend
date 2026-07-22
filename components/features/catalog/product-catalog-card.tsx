"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { Boxes, InfoIcon } from "lucide-react"
import dynamic from "next/dynamic"

import {
  InventoryDepletedModal,
  SHIP_READY_DEPLETED_TITLE,
  shipReadyDepletedDescription,
} from "@/components/features/catalog/inventory-depleted-modal"
import { QuantitySelector } from "@/components/global/quantity-selector"
import { Badge } from "@/components/ui/badge"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"
import { Skeleton } from "@/components/ui/skeleton"

const DynamicImageCarousel = dynamic(
  () => import("@/components/global/image-carousel"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
)

import { useCart, useLocalCartVariantUpdate } from "@/hooks"
import {
  BATCH_DEPLETED_TITLE,
  buildBatchDepletionDescription,
  buildBatchDepletionEvent,
  shouldClearBatchDepletionAcceptance,
  shouldShowBatchDepletion,
} from "@/lib/cart/batch-quota"
import { ensureCartSession } from "@/lib/cart/ensure-cart-session"
import { withShopifyWidth } from "@/lib/shopify-image"
import { useCartStore } from "@/lib/stores/cart.store"
import { formatCurrency } from "@/lib/utils"

import type { BatchDepletion } from "@/types/batches"
import type { ProductCatalogCardProps } from "@/types/products"

export function ProductCatalogCard({ product }: ProductCatalogCardProps) {
  const { market } = useCartStore()
  const markAcceptedBatchDepletion = useCartStore(
    (state) => state.markAcceptedBatchDepletion
  )
  const clearAcceptedBatchDepletion = useCartStore(
    (state) => state.clearAcceptedBatchDepletion
  )

  const [localQuantity, setLocalQuantity] = useState(0)
  const [showDepletedModal, setShowDepletedModal] = useState(false)
  const [batchDepletion, setBatchDepletion] = useState<BatchDepletion | null>(
    null
  )
  const [pendingBatchQuantity, setPendingBatchQuantity] = useState<
    number | null
  >(null)
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
    // Stale acceptance in localStorage blocks the modal permanently otherwise.
    if (shouldClearBatchDepletionAcceptance(product, quantity)) {
      clearAcceptedBatchDepletion(product.sku)
    }
    // product fields read inside shouldClear*; sku/qty are the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid reset on every product object identity change
  }, [quantity, product.sku, clearAcceptedBatchDepletion])

  const applyLocalUpdate = (newTotal: number) => {
    if (shouldClearBatchDepletionAcceptance(product, newTotal)) {
      clearAcceptedBatchDepletion(product.sku)
    }
    setLocalQuantity(newTotal)
    updateLocalCart({
      variantId: product.sku,
      totalQuantity: newTotal,
      meta: variantMeta,
    })
    void ensureCartSession()
  }

  const updateQuantity = (newTotal: number) => {
    if (newTotal < 0) return

    if (isShipReady && !isBackendPreOrder && !isConvertedToPreorder) {
      if (newTotal > product.inventory.quantity) {
        setLocalQuantity(newTotal)
        setShowDepletedModal(true)
        return
      }
    }

    if (shouldClearBatchDepletionAcceptance(product, newTotal)) {
      clearAcceptedBatchDepletion(product.sku)
    }

    const accepted = useCartStore
      .getState()
      .hasAcceptedBatchDepletion(product.sku)
    if (shouldShowBatchDepletion(product, newTotal, accepted)) {
      setPendingBatchQuantity(newTotal)
      setBatchDepletion(buildBatchDepletionEvent(product))
      setLocalQuantity(newTotal)
      return
    }

    applyLocalUpdate(newTotal)
  }

  const handleIncrease = () => {
    updateQuantity(localQuantity + 1)
  }

  const handleDecrease = () => {
    updateQuantity(localQuantity - 1)
  }

  const handleCustomChange = (newTotal: number) => {
    updateQuantity(newTotal)
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

  const handleBatchDepletionConfirm = () => {
    if (pendingBatchQuantity === null) return
    markAcceptedBatchDepletion(product.sku)
    applyLocalUpdate(pendingBatchQuantity)
    setBatchDepletion(null)
    setPendingBatchQuantity(null)
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
              width={256}
              playOnHover
              isHovered={isCardHovered}
              autoplayDelay={1000}
            />
          ) : product.imageUrl ? (
            <Image
              src={withShopifyWidth(product.imageUrl, 256)}
              alt={product.title}
              fill
              className="relative block aspect-square h-auto max-w-full object-cover align-middle transition-opacity duration-200"
              sizes="108px"
              unoptimized
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
          {(product.category === "pre-order" || product.isLtl) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {product.category === "pre-order" && (
                <Badge className="h-5.5! w-fit rounded p-1 text-xs font-normal! uppercase">
                  {product.preorderCustomText
                    ? `PRE-ORDER ${product.preorderCustomText}`
                    : "PRE-ORDER"}
                </Badge>
              )}
              {product.isLtl && (
                <PreviewCard>
                  <PreviewCardTrigger
                    render={
                      <Badge className="h-5.5! w-fit cursor-pointer gap-1 rounded p-1 text-xs font-normal! uppercase" />
                    }
                  >
                    LTL
                    <InfoIcon className="size-3.5 opacity-90" aria-hidden />
                    <span className="sr-only">About LTL shipping</span>
                  </PreviewCardTrigger>
                  <PreviewCardPopup sideOffset={8}>
                    <div className="flex max-w-xs flex-col gap-1.5 p-1">
                      <h4 className="text-sm font-medium text-alternate">
                        LTL - less than truckload
                      </h4>
                      <p className="text-xs text-pretty text-muted-foreground">
                        Shipping cost will be calculated by our team and
                        collected with the final payment
                      </p>
                    </div>
                  </PreviewCardPopup>
                </PreviewCard>
              )}
            </div>
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
                  disabled={false}
                  isPending={false}
                  className="h-9 w-27 border-none sm:w-32.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <InventoryDepletedModal
        isOpen={showDepletedModal}
        imageUrl={product.imageUrl}
        productTitle={product.title}
        title={SHIP_READY_DEPLETED_TITLE}
        description={shipReadyDepletedDescription()}
        onClose={() => {
          setShowDepletedModal(false)
          setLocalQuantity(quantity)
        }}
        onConfirm={handlePreorderConfirm}
        isPending={false}
      />

      <InventoryDepletedModal
        isOpen={!!batchDepletion}
        imageUrl={batchDepletion?.imageUrl}
        productTitle={batchDepletion?.productTitle}
        title={BATCH_DEPLETED_TITLE}
        description={
          batchDepletion
            ? buildBatchDepletionDescription(batchDepletion)
            : null
        }
        isPending={false}
        onClose={() => {
          setBatchDepletion(null)
          setPendingBatchQuantity(null)
          setLocalQuantity(quantity)
        }}
        onConfirm={handleBatchDepletionConfirm}
      />
    </>
  )
}
